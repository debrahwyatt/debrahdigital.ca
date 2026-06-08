<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedOrigin = 'https://debrahdigital.ca';

header("Access-Control-Allow-Origin: {$allowedOrigin}");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Square-Import-Token, X-DDS-Environment');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
    ]);
    exit;
}

$dbHost = 'localhost';
$dbUser = 'XXXXXXXXXXXXXXXXXXXXXXXX';
$dbPass = 'XXXXXXXXXXXXXXXXXXXXXXXX';

$expectedToken = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

$headers = getallheaders();

$providedToken =
    $headers['X-Square-Import-Token']
    ?? $headers['x-square-import-token']
    ?? '';

if (!$expectedToken || !hash_equals($expectedToken, $providedToken)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized',
    ]);
    exit;
}

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

function mysqlDate(?string $value): ?string {
    if (!$value) {
        return null;
    }

    try {
        $date = new DateTime($value);
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
            CURLOPT_USERAGENT => 'DebrahsDigitalSolutionsSquareImporter/1.0',
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
            'header' => "User-Agent: DebrahsDigitalSolutionsSquareImporter/1.0\r\n",
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

function cacheSquareImage(?string $variationId, ?string $imageUrl): ?string {
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
    $uploadDir = $publicRoot . '/uploads/square-images';
    $publicBasePath = '/uploads/square-images';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $baseName = safeFilePart((string)$variationId);

    $existing = glob($uploadDir . '/' . $baseName . '.*');

    if (is_array($existing) && count($existing) > 0) {
        return $publicBasePath . '/' . basename($existing[0]);
    }

    $download = downloadUrl($imageUrl);

    if (!$download['ok'] || !is_string($download['body'])) {
        return $imageUrl;
    }

    $extension = getImageExtensionFromContentType($download['contentType']);
    $filename = $baseName . '.' . $extension;
    $filePath = $uploadDir . '/' . $filename;

    file_put_contents($filePath, $download['body']);

    return $publicBasePath . '/' . $filename;
}

$rawBody = file_get_contents('php://input');

if (!$rawBody) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing request body',
    ]);
    exit;
}

$data = json_decode($rawBody, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON',
    ]);
    exit;
}

$exportedAt = isset($data['exportedAt']) ? (string)$data['exportedAt'] : '';
$products = $data['products'] ?? null;

if (!is_array($products)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing products array',
    ]);
    exit;
}

$dbName = getCatalogDatabaseName();

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ],
    );

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO square_products (
            variation_id,
            square_id,

            name,
            description,

            price_cents,
            price,
            currency,

            sku,

            image_ids_json,
            primary_image_id,
            image_url,

            category_id,
            category_name,

            track_inventory,
            stockable,
            sellable,
            sold_out,

            inventory_alert_threshold,

            quantity,

            square_updated_at,
            exported_at,
            imported_at
        ) VALUES (
            :variation_id,
            :square_id,

            :name,
            :description,

            :price_cents,
            :price,
            :currency,

            :sku,

            :image_ids_json,
            :primary_image_id,
            :image_url,

            :category_id,
            :category_name,

            :track_inventory,
            :stockable,
            :sellable,
            :sold_out,

            :inventory_alert_threshold,

            :quantity,

            :square_updated_at,
            :exported_at,
            NOW()
        )
        ON DUPLICATE KEY UPDATE
            square_id = VALUES(square_id),

            name = VALUES(name),
            description = VALUES(description),

            price_cents = VALUES(price_cents),
            price = VALUES(price),
            currency = VALUES(currency),

            sku = VALUES(sku),

            image_ids_json = VALUES(image_ids_json),
            primary_image_id = VALUES(primary_image_id),
            image_url = VALUES(image_url),

            category_id = VALUES(category_id),
            category_name = VALUES(category_name),

            track_inventory = VALUES(track_inventory),
            stockable = VALUES(stockable),
            sellable = VALUES(sellable),
            sold_out = VALUES(sold_out),

            inventory_alert_threshold = VALUES(inventory_alert_threshold),

            quantity = VALUES(quantity),

            square_updated_at = VALUES(square_updated_at),
            exported_at = VALUES(exported_at),
            imported_at = NOW()
    ");

    $activeVariationIds = [];
    $cachedImages = 0;

    foreach ($products as $product) {
        if (!is_array($product)) {
            continue;
        }

        $variationId = isset($product['variationId'])
            ? trim((string)$product['variationId'])
            : '';

        if ($variationId === '') {
            continue;
        }

        $activeVariationIds[] = $variationId;

        $imageIds = $product['imageIds'] ?? [];

        if (!is_array($imageIds)) {
            $imageIds = [];
        }

        $originalImageUrl = isset($product['imageUrl']) && $product['imageUrl'] !== ''
            ? (string)$product['imageUrl']
            : null;

        $imageUrl = cacheSquareImage($variationId, $originalImageUrl);

        if ($imageUrl !== null && $imageUrl !== $originalImageUrl) {
            $cachedImages++;
        }

        $stmt->execute([
            ':variation_id' => $variationId,
            ':square_id' => (string)($product['id'] ?? ''),

            ':name' => (string)($product['name'] ?? ''),
            ':description' => (string)($product['description'] ?? ''),

            ':price_cents' => (int)($product['priceCents'] ?? 0),
            ':price' => (float)($product['price'] ?? 0),
            ':currency' => (string)($product['currency'] ?? 'CAD'),

            ':sku' => isset($product['sku']) && $product['sku'] !== ''
                ? (string)$product['sku']
                : null,

            ':image_ids_json' => json_encode($imageIds),
            ':primary_image_id' => isset($product['primaryImageId']) && $product['primaryImageId'] !== ''
                ? (string)$product['primaryImageId']
                : null,
            ':image_url' => $imageUrl ?? $originalImageUrl,

            ':category_id' => (string)($product['categoryId'] ?? ''),
            ':category_name' => (string)($product['categoryName'] ?? 'Uncategorized'),

            ':track_inventory' => !empty($product['trackInventory']) ? 1 : 0,
            ':stockable' => !empty($product['stockable']) ? 1 : 0,
            ':sellable' => !empty($product['sellable']) ? 1 : 0,
            ':sold_out' => !empty($product['soldOut']) ? 1 : 0,

            ':inventory_alert_threshold' => isset($product['inventoryAlertThreshold'])
                ? (int)$product['inventoryAlertThreshold']
                : null,

            ':quantity' => (int)($product['quantity'] ?? 0),

            ':square_updated_at' => mysqlDate((string)($product['updatedAt'] ?? '')),
            ':exported_at' => mysqlDate($exportedAt),
        ]);
    }

    if (count($activeVariationIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($activeVariationIds), '?'));

        $deleteStmt = $pdo->prepare("
            DELETE FROM square_products
            WHERE variation_id NOT IN ({$placeholders})
        ");

        $deleteStmt->execute($activeVariationIds);
    } else {
        $pdo->exec("DELETE FROM square_products");
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Square products imported successfully',
        'environment' => getImportEnvironment(),
        'database' => $dbName,
        'receivedCount' => count($products),
        'importedCount' => count($activeVariationIds),
        'cachedImages' => $cachedImages,
        'exportedAt' => $exportedAt,
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Square product import failed',
        'environment' => getImportEnvironment(),
        'database' => $dbName ?? null,
        'details' => $error->getMessage(),
    ]);
}