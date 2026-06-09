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

if (!is_array($data) || !isset($data['products']) || !is_array($data['products'])) {
    sendJson(400, [
        'success' => false,
        'error' => 'Invalid image update JSON',
    ]);
}

$dbHost = (string)$config['CATALOG_DB_HOST'];
$dbUser = (string)$config['CATALOG_DB_USER'];
$dbPass = (string)$config['CATALOG_DB_PASS'];
$dbName = getCatalogDatabaseName($config);

$dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";

try {
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
    $missing = 0;
    $skipped = 0;

    foreach ($data['products'] as $product) {
        $received++;

        $ingramPartNumber = trim((string)($product['ingramPartNumber'] ?? ''));

        if ($ingramPartNumber === '') {
            $skipped++;
            continue;
        }

        $imageUrl = $product['imageUrl'] ?? null;
        $thumbnailUrl = $product['thumbnailUrl'] ?? null;
        $brandLogoUrl = $product['brandLogoUrl'] ?? null;
        $galleryUrls = $product['galleryUrls'] ?? [];

        if (!is_array($galleryUrls)) {
            $galleryUrls = [];
        }

        $stmt->execute([
            ':ingram_part_number' => $ingramPartNumber,
            ':image_url' => $imageUrl,
            ':thumbnail_url' => $thumbnailUrl,
            ':brand_logo_url' => $brandLogoUrl,
            ':gallery_urls' => json_encode($galleryUrls),
        ]);

        if ($stmt->rowCount() > 0) {
            $updated++;
        } else {
            $missing++;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Catalog image URLs updated successfully',
        'environment' => getImportEnvironment(),
        'database' => $dbName,
        'receivedCount' => $received,
        'updatedCount' => $updated,
        'missingOrUnchangedCount' => $missing,
        'skippedCount' => $skipped,
    ]);

    exit;
} catch (Throwable $e) {
    sendJson(500, [
        'success' => false,
        'error' => 'Image URL import failed',
        'environment' => getImportEnvironment(),
        'database' => $dbName ?? null,
        'message' => $e->getMessage(),
    ]);
}