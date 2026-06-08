<?php
declare(strict_types=1);

header('Content-Type: application/json');

$IMPORT_TOKEN = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

$providedToken = $_SERVER['HTTP_X_CATALOG_IMPORT_TOKEN'] ?? '';

if (!hash_equals($IMPORT_TOKEN, $providedToken)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$rawBody = file_get_contents('php://input');

if (!$rawBody) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing JSON body']);
    exit;
}

$data = json_decode($rawBody, true);

if (!is_array($data) || !isset($data['products']) || !is_array($data['products'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid catalog JSON']);
    exit;
}

$dbUser = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
$dbPass = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

function getImportEnvironment(): string {
    $env = strtolower(trim($_SERVER['HTTP_X_DDS_ENVIRONMENT'] ?? 'production'));

    if ($env === 'development' || $env === 'dev') {
        return 'development';
    }

    return 'production';
}

function getCatalogDatabaseName(): string {
    return getImportEnvironment() === 'development'
        ? 'catalog_dev'
        : 'catalog';
}

function mysqlDate(?string $iso): ?string {
    if (!$iso) {
        return null;
    }

    try {
        $date = new DateTime($iso);
        $date->setTimezone(new DateTimeZone('America/Edmonton'));

        return $date->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return null;
    }
}

function safeFilePart(string $value): string {
    $value = preg_replace('/[^A-Za-z0-9_-]+/', '-', $value);
    $value = trim((string)$value, '-');

    return $value !== '' ? $value : 'image';
}

function getImageExtensionFromContentType(?string $contentType): string {
    $contentType = strtolower(trim((string)$contentType));

    if (str_contains($contentType, 'image/png')) {
        return 'png';
    }

    if (str_contains($contentType, 'image/webp')) {
        return 'webp';
    }

    if (str_contains($contentType, 'image/gif')) {
        return 'gif';
    }

    return 'jpg';
}

function downloadUrl(string $url): array {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_USERAGENT => 'DebrahsDigitalSolutionsCatalogImporter/1.0',
            CURLOPT_HEADER => true,
        ]);

        $response = curl_exec($ch);

        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);

            return [
                'ok' => false,
                'body' => null,
                'contentType' => null,
                'error' => $error,
            ];
        }

        $statusCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $headerSize = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

        curl_close($ch);

        $body = substr((string)$response, $headerSize);

        return [
            'ok' => $statusCode >= 200 && $statusCode < 300 && $body !== '',
            'body' => $body,
            'contentType' => is_string($contentType) ? $contentType : null,
            'error' => null,
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 30,
            'header' => "User-Agent: DebrahsDigitalSolutionsCatalogImporter/1.0\r\n",
        ],
    ]);

    $body = @file_get_contents($url, false, $context);

    if ($body === false || $body === '') {
        return [
            'ok' => false,
            'body' => null,
            'contentType' => null,
            'error' => 'file_get_contents failed',
        ];
    }

    $contentType = null;

    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (stripos($header, 'Content-Type:') === 0) {
                $contentType = trim(substr($header, strlen('Content-Type:')));
                break;
            }
        }
    }

    return [
        'ok' => true,
        'body' => $body,
        'contentType' => $contentType,
        'error' => null,
    ];
}

function cacheCatalogImage(
    ?string $ingramPartNumber,
    ?string $imageUrl,
    string $suffix = 'main'
): ?string {
    $imageUrl = trim((string)$imageUrl);

    if ($imageUrl === '') {
        return null;
    }

    if (str_starts_with($imageUrl, '/uploads/')) {
        return $imageUrl;
    }

    if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
        return $imageUrl;
    }

    $publicRoot = dirname(__DIR__);
    $uploadDir = $publicRoot . '/uploads/catalog-images';
    $publicBasePath = '/uploads/catalog-images';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $baseName = safeFilePart((string)$ingramPartNumber);
    $suffix = safeFilePart($suffix);

    $existing = glob($uploadDir . '/' . $baseName . '-' . $suffix . '.*');

    if (is_array($existing) && count($existing) > 0) {
        return $publicBasePath . '/' . basename($existing[0]);
    }

    $download = downloadUrl($imageUrl);

    if (!$download['ok'] || !is_string($download['body'])) {
        return $imageUrl;
    }

    $extension = getImageExtensionFromContentType($download['contentType']);
    $filename = $baseName . '-' . $suffix . '.' . $extension;
    $filePath = $uploadDir . '/' . $filename;

    file_put_contents($filePath, $download['body']);

    return $publicBasePath . '/' . $filename;
}

function cacheGalleryImages(?string $ingramPartNumber, array $galleryUrls): array {
    $cached = [];
    $index = 1;

    foreach ($galleryUrls as $url) {
        if (!is_string($url) || trim($url) === '') {
            continue;
        }

        if ($index > 8) {
            break;
        }

        $cached[] = cacheCatalogImage($ingramPartNumber, $url, 'gallery-' . $index) ?? $url;
        $index++;
    }

    return $cached;
}

$dbName = getCatalogDatabaseName();
$dsn = "mysql:host=localhost;dbname={$dbName};charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->beginTransaction();

    $syncStmt = $pdo->prepare("
        INSERT INTO catalog_sync_runs (
            source,
            last_synced_at,
            ingram_last_synced_at,
            icecat_last_synced_at,
            product_count,
            ingram_product_count,
            icecat_product_count,
            icecat_matched_count,
            icecat_with_image_count
        ) VALUES (
            :source,
            :last_synced_at,
            :ingram_last_synced_at,
            :icecat_last_synced_at,
            :product_count,
            :ingram_product_count,
            :icecat_product_count,
            :icecat_matched_count,
            :icecat_with_image_count
        )
    ");

    $syncStmt->execute([
        ':source' => $data['source'] ?? 'unknown',
        ':last_synced_at' => mysqlDate($data['lastSyncedAt'] ?? null),
        ':ingram_last_synced_at' => mysqlDate($data['ingramLastSyncedAt'] ?? null),
        ':icecat_last_synced_at' => mysqlDate($data['icecatLastSyncedAt'] ?? null),
        ':product_count' => (int)($data['productCount'] ?? count($data['products'])),
        ':ingram_product_count' => (int)($data['ingramProductCount'] ?? 0),
        ':icecat_product_count' => (int)($data['icecatProductCount'] ?? 0),
        ':icecat_matched_count' => (int)($data['icecatMatchedCount'] ?? 0),
        ':icecat_with_image_count' => (int)($data['icecatWithImageCount'] ?? 0),
    ]);

    $syncRunId = (int)$pdo->lastInsertId();

    $upsertStmt = $pdo->prepare("
        INSERT INTO catalog_products (
            ingram_part_number,
            vendor_part_number,
            upc,
            vendor_name,
            description,
            extra_description,
            full_description,
            category,
            sub_category,
            product_type,
            catalog_category,
            currency,
            cost,
            sell_price,
            available,
            total_availability,
            image_url,
            thumbnail_url,
            brand_logo_url,
            gallery_urls,
            features,
            specifications,
            visible,
            icecat_id,
            icecat_matched,
            icecat_matched_by,
            icecat_last_checked_at,
            source_last_synced_at,
            sync_run_id
        ) VALUES (
            :ingram_part_number,
            :vendor_part_number,
            :upc,
            :vendor_name,
            :description,
            :extra_description,
            :full_description,
            :category,
            :sub_category,
            :product_type,
            :catalog_category,
            :currency,
            :cost,
            :sell_price,
            :available,
            :total_availability,
            :image_url,
            :thumbnail_url,
            :brand_logo_url,
            :gallery_urls,
            :features,
            :specifications,
            :visible,
            :icecat_id,
            :icecat_matched,
            :icecat_matched_by,
            :icecat_last_checked_at,
            :source_last_synced_at,
            :sync_run_id
        )
        ON DUPLICATE KEY UPDATE
            vendor_part_number = VALUES(vendor_part_number),
            upc = VALUES(upc),
            vendor_name = VALUES(vendor_name),
            description = VALUES(description),
            extra_description = VALUES(extra_description),
            full_description = VALUES(full_description),
            category = VALUES(category),
            sub_category = VALUES(sub_category),
            product_type = VALUES(product_type),
            catalog_category = VALUES(catalog_category),
            currency = VALUES(currency),
            cost = VALUES(cost),
            sell_price = VALUES(sell_price),
            available = VALUES(available),
            total_availability = VALUES(total_availability),
            image_url = VALUES(image_url),
            thumbnail_url = VALUES(thumbnail_url),
            brand_logo_url = VALUES(brand_logo_url),
            gallery_urls = VALUES(gallery_urls),
            features = VALUES(features),
            specifications = VALUES(specifications),
            visible = VALUES(visible),
            icecat_id = VALUES(icecat_id),
            icecat_matched = VALUES(icecat_matched),
            icecat_matched_by = VALUES(icecat_matched_by),
            icecat_last_checked_at = VALUES(icecat_last_checked_at),
            source_last_synced_at = VALUES(source_last_synced_at),
            sync_run_id = VALUES(sync_run_id)
    ");

    $imported = 0;
    $cachedImages = 0;

    foreach ($data['products'] as $product) {
        if (empty($product['ingramPartNumber'])) {
            continue;
        }

        $cost = (float)($product['cost'] ?? 0);
        $sellPrice = (float)($product['sellPrice'] ?? 0);

        if ($cost <= 0 || $sellPrice <= 0) {
            continue;
        }

        $ingramPartNumber = (string)$product['ingramPartNumber'];

        $originalImageUrl = $product['imageUrl'] ?? null;
        $originalThumbnailUrl = $product['thumbnailUrl'] ?? null;
        $originalBrandLogoUrl = $product['brandLogoUrl'] ?? null;
        $originalGalleryUrls = is_array($product['galleryUrls'] ?? null)
            ? $product['galleryUrls']
            : [];

        $imageUrl = cacheCatalogImage($ingramPartNumber, is_string($originalImageUrl) ? $originalImageUrl : null, 'main');
        $thumbnailUrl = cacheCatalogImage($ingramPartNumber, is_string($originalThumbnailUrl) ? $originalThumbnailUrl : null, 'thumb');
        $brandLogoUrl = cacheCatalogImage($ingramPartNumber, is_string($originalBrandLogoUrl) ? $originalBrandLogoUrl : null, 'brand');
        $galleryUrls = cacheGalleryImages($ingramPartNumber, $originalGalleryUrls);

        if ($imageUrl !== $originalImageUrl && $imageUrl !== null) {
            $cachedImages++;
        }

        $upsertStmt->execute([
            ':ingram_part_number' => $ingramPartNumber,
            ':vendor_part_number' => $product['vendorPartNumber'] ?? null,
            ':upc' => $product['upc'] ?? null,
            ':vendor_name' => $product['vendorName'] ?? null,
            ':description' => $product['description'] ?? '',
            ':extra_description' => $product['extraDescription'] ?? null,
            ':full_description' => $product['fullDescription'] ?? null,
            ':category' => $product['category'] ?? null,
            ':sub_category' => $product['subCategory'] ?? null,
            ':product_type' => $product['productType'] ?? null,
            ':catalog_category' => $product['catalogCategory'] ?? 'uncategorized',
            ':currency' => $product['currency'] ?? 'CAD',
            ':cost' => $cost,
            ':sell_price' => $sellPrice,
            ':available' => !empty($product['available']) ? 1 : 0,
            ':total_availability' => (int)($product['totalAvailability'] ?? 0),
            ':image_url' => $imageUrl ?? $originalImageUrl,
            ':thumbnail_url' => $thumbnailUrl ?? $originalThumbnailUrl,
            ':brand_logo_url' => $brandLogoUrl ?? $originalBrandLogoUrl,
            ':gallery_urls' => json_encode($galleryUrls),
            ':features' => json_encode($product['features'] ?? []),
            ':specifications' => json_encode($product['specifications'] ?? []),
            ':visible' => !empty($product['visible']) ? 1 : 0,
            ':icecat_id' => $product['icecatId'] ?? null,
            ':icecat_matched' => !empty($product['icecatMatched']) ? 1 : 0,
            ':icecat_matched_by' => $product['icecatMatchedBy'] ?? null,
            ':icecat_last_checked_at' => mysqlDate($product['icecatLastCheckedAt'] ?? null),
            ':source_last_synced_at' => mysqlDate($product['lastSyncedAt'] ?? null),
            ':sync_run_id' => $syncRunId,
        ]);

        $imported++;
    }

    $hideOldStmt = $pdo->prepare("
        UPDATE catalog_products
        SET visible = 0, available = 0
        WHERE sync_run_id IS NULL OR sync_run_id != :sync_run_id
    ");

    $hideOldStmt->execute([
        ':sync_run_id' => $syncRunId,
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'environment' => getImportEnvironment(),
        'database' => $dbName,
        'syncRunId' => $syncRunId,
        'imported' => $imported,
        'cachedImages' => $cachedImages,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'error' => 'Import failed',
        'environment' => getImportEnvironment(),
        'database' => $dbName ?? null,
        'message' => $e->getMessage(),
    ]);
}