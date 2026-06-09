<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function sendJson(int $statusCode, array $payload): void {
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function loadCatalogConfig(): array {
    $configPath = __DIR__ . '/../../dds-catalog-config.env';

    if (!is_readable($configPath)) {
        sendJson(500, [
            'success' => false,
            'error' => 'Server configuration error',
            'message' => 'Catalog configuration file is missing or not readable.',
        ]);
    }

    $config = parse_ini_file($configPath, false, INI_SCANNER_RAW);

    if ($config === false) {
        sendJson(500, [
            'success' => false,
            'error' => 'Server configuration error',
            'message' => 'Catalog configuration file could not be parsed.',
        ]);
    }

    $requiredKeys = [
        'CATALOG_IMPORT_TOKEN',
        'CATALOG_DB_HOST',
        'CATALOG_DB_USER',
        'CATALOG_DB_PASS',
        'CATALOG_DB_PROD',
        'CATALOG_DB_DEV',
    ];

    foreach ($requiredKeys as $key) {
        if (!array_key_exists($key, $config) || trim((string)$config[$key]) === '') {
            sendJson(500, [
                'success' => false,
                'error' => 'Server configuration error',
                'message' => "Missing required config value: {$key}",
            ]);
        }
    }

    return $config;
}

function getImportEnvironment(): string {
    $env = strtolower(trim($_SERVER['HTTP_X_DDS_ENVIRONMENT'] ?? 'production'));

    if ($env === 'development' || $env === 'dev') {
        return 'development';
    }

    return 'production';
}

function getCatalogDatabaseName(array $config): string {
    return getImportEnvironment() === 'development'
        ? (string)$config['CATALOG_DB_DEV']
        : (string)$config['CATALOG_DB_PROD'];
}

function cleanString(mixed $value): string {
    return trim((string)($value ?? ''));
}

function safePathSegment(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9_-]+/', '-', $value) ?? '';
    $value = trim($value, '-');

    if ($value === '') {
        return 'unknown-product';
    }

    return substr($value, 0, 80);
}

function urlHash(string $url): string {
    return substr(sha1($url), 0, 12);
}

function isAllowedImageUrl(string $url): bool {
    if ($url === '') {
        return false;
    }

    $parts = parse_url($url);

    if (!is_array($parts)) {
        return false;
    }

    $scheme = strtolower((string)($parts['scheme'] ?? ''));

    return $scheme === 'https' || $scheme === 'http';
}

function getExtensionFromContentType(?string $contentType): ?string {
    $contentType = strtolower(trim((string)$contentType));

    if (str_contains($contentType, 'image/jpeg') || str_contains($contentType, 'image/jpg')) {
        return 'jpg';
    }

    if (str_contains($contentType, 'image/png')) {
        return 'png';
    }

    if (str_contains($contentType, 'image/webp')) {
        return 'webp';
    }

    if (str_contains($contentType, 'image/gif')) {
        return 'gif';
    }

    return null;
}

function getExtensionFromUrl(string $url): string {
    $path = parse_url($url, PHP_URL_PATH);
    $extension = strtolower(pathinfo((string)$path, PATHINFO_EXTENSION));

    if ($extension === 'jpeg') {
        return 'jpg';
    }

    if (in_array($extension, ['jpg', 'png', 'webp', 'gif'], true)) {
        return $extension;
    }

    return 'jpg';
}

function getPublicHtmlRoot(): string {
    $root = realpath(__DIR__ . '/../');

    if ($root === false) {
        sendJson(500, [
            'success' => false,
            'error' => 'Server configuration error',
            'message' => 'Could not resolve public_html path.',
        ]);
    }

    return $root;
}

function ensureDirectory(string $path): void {
    if (is_dir($path)) {
        return;
    }

    if (!mkdir($path, 0755, true) && !is_dir($path)) {
        throw new RuntimeException("Could not create directory: {$path}");
    }
}

function downloadRemoteImage(string $url, string $targetPath): array {
    if (!isAllowedImageUrl($url)) {
        throw new RuntimeException("Invalid image URL: {$url}");
    }

    $ch = curl_init($url);

    if ($ch === false) {
        throw new RuntimeException('Could not initialize cURL.');
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'DDS-Catalog-Image-Importer/1.0',
        CURLOPT_HTTPHEADER => [
            'Accept: image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
        ],
    ]);

    $body = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $error = curl_error($ch);

    curl_close($ch);

    if ($body === false || $body === '') {
        throw new RuntimeException("Download failed for {$url}: {$error}");
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        throw new RuntimeException("Download failed for {$url}: HTTP {$httpCode}");
    }

    if (!str_starts_with(strtolower($contentType), 'image/')) {
        throw new RuntimeException("Invalid content type for {$url}: {$contentType}");
    }

    $bytesWritten = file_put_contents($targetPath, $body);

    if ($bytesWritten === false || $bytesWritten <= 0) {
        throw new RuntimeException("Could not write image to {$targetPath}");
    }

    chmod($targetPath, 0644);

    return [
        'bytes' => $bytesWritten,
        'contentType' => $contentType,
    ];
}

function saveCatalogImage(
    ?string $sourceUrl,
    string $imageRoot,
    string $publicBaseUrl,
    string $ingramPartNumber,
    string $role,
    int $index = 0
): ?array {
    $sourceUrl = cleanString($sourceUrl);

    if ($sourceUrl === '') {
        return null;
    }

    if (str_starts_with($sourceUrl, $publicBaseUrl . '/')) {
        return [
            'sourceUrl' => $sourceUrl,
            'publicUrl' => $sourceUrl,
            'status' => 'already-local',
            'bytes' => 0,
        ];
    }

    $safeIngramPartNumber = safePathSegment($ingramPartNumber);
    $productDir = $imageRoot . '/' . $safeIngramPartNumber;

    ensureDirectory($productDir);

    $urlHash = urlHash($sourceUrl);
    $extension = getExtensionFromUrl($sourceUrl);

    if ($role === 'gallery') {
        $baseName = 'gallery-' . str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT) . '-' . $urlHash;
    } else {
        $baseName = $role . '-' . $urlHash;
    }

    $fileName = "{$baseName}.{$extension}";
    $targetPath = "{$productDir}/{$fileName}";
    $publicUrl = "{$publicBaseUrl}/{$safeIngramPartNumber}/{$fileName}";

    if (is_file($targetPath) && filesize($targetPath) > 0) {
        return [
            'sourceUrl' => $sourceUrl,
            'publicUrl' => $publicUrl,
            'status' => 'existing',
            'bytes' => filesize($targetPath),
        ];
    }

    $result = downloadRemoteImage($sourceUrl, $targetPath);

    $contentTypeExtension = getExtensionFromContentType($result['contentType'] ?? null);

    if ($contentTypeExtension !== null && $contentTypeExtension !== $extension) {
        $correctedFileName = "{$baseName}.{$contentTypeExtension}";
        $correctedTargetPath = "{$productDir}/{$correctedFileName}";
        $correctedPublicUrl = "{$publicBaseUrl}/{$safeIngramPartNumber}/{$correctedFileName}";

        if ($correctedTargetPath !== $targetPath) {
            rename($targetPath, $correctedTargetPath);
            $targetPath = $correctedTargetPath;
            $publicUrl = $correctedPublicUrl;
        }
    }

    return [
        'sourceUrl' => $sourceUrl,
        'publicUrl' => $publicUrl,
        'status' => 'downloaded',
        'bytes' => filesize($targetPath) ?: ($result['bytes'] ?? 0),
    ];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(405, [
        'success' => false,
        'error' => 'Method not allowed',
    ]);
}

$config = loadCatalogConfig();

$providedToken = $_SERVER['HTTP_X_CATALOG_IMPORT_TOKEN'] ?? '';

if (!hash_equals((string)$config['CATALOG_IMPORT_TOKEN'], $providedToken)) {
    sendJson(401, [
        'success' => false,
        'error' => 'Unauthorized',
    ]);
}

$rawBody = file_get_contents('php://input');

if (!$rawBody) {
    sendJson(400, [
        'success' => false,
        'error' => 'Missing JSON body',
    ]);
}

$data = json_decode($rawBody, true);

if (!is_array($data)) {
    sendJson(400, [
        'success' => false,
        'error' => 'Invalid JSON body',
    ]);
}

if (isset($data['product']) && is_array($data['product'])) {
    $products = [$data['product']];
} elseif (isset($data['products']) && is_array($data['products'])) {
    $products = $data['products'];
} else {
    sendJson(400, [
        'success' => false,
        'error' => 'Invalid image import JSON. Expected product or products.',
    ]);
}

$publicHtmlRoot = getPublicHtmlRoot();
$imageRoot = $publicHtmlRoot . '/catalog-images';
$publicBaseUrl = '/catalog-images';

try {
    ensureDirectory($imageRoot);

    $dbHost = (string)$config['CATALOG_DB_HOST'];
    $dbUser = (string)$config['CATALOG_DB_USER'];
    $dbPass = (string)$config['CATALOG_DB_PASS'];
    $dbName = getCatalogDatabaseName($config);

    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";

    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare("
        UPDATE catalog_products
        SET
            image_url = :image_url,
            thumbnail_url = :thumbnail_url,
            brand_logo_url = :brand_logo_url,
            gallery_urls = :gallery_urls,
            updated_at = NOW()
        WHERE ingram_part_number = :ingram_part_number
    ");

    $received = 0;
    $updated = 0;
    $missingOrUnchanged = 0;
    $skipped = 0;
    $failed = 0;
    $downloadedFiles = 0;
    $existingFiles = 0;

    $results = [];

    foreach ($products as $product) {
        $received++;

        if (!is_array($product)) {
            $skipped++;
            continue;
        }

        $ingramPartNumber = cleanString($product['ingramPartNumber'] ?? '');

        if ($ingramPartNumber === '') {
            $skipped++;
            continue;
        }

        $productResult = [
            'ingramPartNumber' => $ingramPartNumber,
            'success' => false,
            'imageUrl' => null,
            'thumbnailUrl' => null,
            'brandLogoUrl' => null,
            'galleryUrls' => [],
            'downloads' => [],
            'error' => null,
        ];

        try {
            $mainImage = saveCatalogImage(
                $product['imageUrl'] ?? null,
                $imageRoot,
                $publicBaseUrl,
                $ingramPartNumber,
                'main'
            );

            if ($mainImage !== null) {
                $productResult['imageUrl'] = $mainImage['publicUrl'];
                $productResult['downloads'][] = array_merge(['role' => 'main'], $mainImage);

                if ($mainImage['status'] === 'downloaded') {
                    $downloadedFiles++;
                } elseif ($mainImage['status'] === 'existing' || $mainImage['status'] === 'already-local') {
                    $existingFiles++;
                }
            }

            $thumbnailImage = saveCatalogImage(
                $product['thumbnailUrl'] ?? null,
                $imageRoot,
                $publicBaseUrl,
                $ingramPartNumber,
                'thumbnail'
            );

            if ($thumbnailImage !== null) {
                $productResult['thumbnailUrl'] = $thumbnailImage['publicUrl'];
                $productResult['downloads'][] = array_merge(['role' => 'thumbnail'], $thumbnailImage);

                if ($thumbnailImage['status'] === 'downloaded') {
                    $downloadedFiles++;
                } elseif ($thumbnailImage['status'] === 'existing' || $thumbnailImage['status'] === 'already-local') {
                    $existingFiles++;
                }
            }

            $brandLogo = saveCatalogImage(
                $product['brandLogoUrl'] ?? null,
                $imageRoot,
                $publicBaseUrl,
                $ingramPartNumber,
                'brand'
            );

            if ($brandLogo !== null) {
                $productResult['brandLogoUrl'] = $brandLogo['publicUrl'];
                $productResult['downloads'][] = array_merge(['role' => 'brand'], $brandLogo);

                if ($brandLogo['status'] === 'downloaded') {
                    $downloadedFiles++;
                } elseif ($brandLogo['status'] === 'existing' || $brandLogo['status'] === 'already-local') {
                    $existingFiles++;
                }
            }

            $galleryUrls = $product['galleryUrls'] ?? [];

            if (!is_array($galleryUrls)) {
                $galleryUrls = [];
            }

            $galleryIndex = 0;

            foreach ($galleryUrls as $galleryUrl) {
                $galleryImage = saveCatalogImage(
                    is_string($galleryUrl) ? $galleryUrl : null,
                    $imageRoot,
                    $publicBaseUrl,
                    $ingramPartNumber,
                    'gallery',
                    $galleryIndex
                );

                if ($galleryImage !== null) {
                    $productResult['galleryUrls'][] = $galleryImage['publicUrl'];
                    $productResult['downloads'][] = array_merge(['role' => 'gallery'], $galleryImage);

                    if ($galleryImage['status'] === 'downloaded') {
                        $downloadedFiles++;
                    } elseif ($galleryImage['status'] === 'existing' || $galleryImage['status'] === 'already-local') {
                        $existingFiles++;
                    }
                }

                $galleryIndex++;
            }

            $stmt->execute([
                ':ingram_part_number' => $ingramPartNumber,
                ':image_url' => $productResult['imageUrl'],
                ':thumbnail_url' => $productResult['thumbnailUrl'],
                ':brand_logo_url' => $productResult['brandLogoUrl'],
                ':gallery_urls' => json_encode($productResult['galleryUrls']),
            ]);

            if ($stmt->rowCount() > 0) {
                $updated++;
            } else {
                $missingOrUnchanged++;
            }

            $productResult['success'] = true;
        } catch (Throwable $e) {
            $failed++;
            $productResult['error'] = $e->getMessage();
        }

        $results[] = $productResult;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Catalog images imported successfully',
        'environment' => getImportEnvironment(),
        'database' => $dbName,
        'imageRoot' => $imageRoot,
        'publicBaseUrl' => $publicBaseUrl,
        'receivedCount' => $received,
        'updatedCount' => $updated,
        'missingOrUnchangedCount' => $missingOrUnchanged,
        'skippedCount' => $skipped,
        'failedCount' => $failed,
        'downloadedFiles' => $downloadedFiles,
        'existingFiles' => $existingFiles,
        'results' => $results,
    ]);

    exit;
} catch (Throwable $e) {
    sendJson(500, [
        'success' => false,
        'error' => 'Image import failed',
        'environment' => getImportEnvironment(),
        'database' => $dbName ?? null,
        'message' => $e->getMessage(),
    ]);
}