<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedOrigin = 'https://debrahdigital.ca';

header("Access-Control-Allow-Origin: {$allowedOrigin}");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Square-Import-Token');

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

/**
 * Update these to match your existing catalog DB connection.
 */
$dbHost = 'localhost';
$dbName = 'debra512_shop_user';
$dbUser = 'debra512_shop';
$dbPass = 'l(LwCA6=SeeWt;n[';

$expectedToken = 'SQUARE_IMPORT_TOKEN=pHghAEdP6jOYjp79X6xDcJ5fBqOfQUwb09rIfeGYhe75ff8c29fMFGYHPcYemDLa';

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

$exportedAt = isset($data['exportedAt']) ? (string) $data['exportedAt'] : '';
$products = $data['products'] ?? null;

if (!is_array($products)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing products array',
    ]);
    exit;
}

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

    foreach ($products as $product) {
        if (!is_array($product)) {
            continue;
        }

        $variationId = isset($product['variationId'])
            ? trim((string) $product['variationId'])
            : '';

        if ($variationId === '') {
            continue;
        }

        $activeVariationIds[] = $variationId;

        $imageIds = $product['imageIds'] ?? [];

        if (!is_array($imageIds)) {
            $imageIds = [];
        }

        $stmt->execute([
            ':variation_id' => $variationId,
            ':square_id' => (string) ($product['id'] ?? ''),

            ':name' => (string) ($product['name'] ?? ''),
            ':description' => (string) ($product['description'] ?? ''),

            ':price_cents' => (int) ($product['priceCents'] ?? 0),
            ':price' => (float) ($product['price'] ?? 0),
            ':currency' => (string) ($product['currency'] ?? 'CAD'),

            ':sku' => isset($product['sku']) && $product['sku'] !== ''
                ? (string) $product['sku']
                : null,

            ':image_ids_json' => json_encode($imageIds),
            ':primary_image_id' => isset($product['primaryImageId']) && $product['primaryImageId'] !== ''
                ? (string) $product['primaryImageId']
                : null,
            ':image_url' => isset($product['imageUrl']) && $product['imageUrl'] !== ''
                ? (string) $product['imageUrl']
                : null,

            ':category_id' => (string) ($product['categoryId'] ?? ''),
            ':category_name' => (string) ($product['categoryName'] ?? 'Uncategorized'),

            ':track_inventory' => !empty($product['trackInventory']) ? 1 : 0,
            ':stockable' => !empty($product['stockable']) ? 1 : 0,
            ':sellable' => !empty($product['sellable']) ? 1 : 0,
            ':sold_out' => !empty($product['soldOut']) ? 1 : 0,

            ':inventory_alert_threshold' => isset($product['inventoryAlertThreshold'])
                ? (int) $product['inventoryAlertThreshold']
                : null,

            ':quantity' => (int) ($product['quantity'] ?? 0),

            ':square_updated_at' => (string) ($product['updatedAt'] ?? ''),
            ':exported_at' => $exportedAt,
        ]);
    }

    /**
     * Remove products that are no longer in the Square export.
     * This keeps the website DB matching Square.
     */
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
        'receivedCount' => count($products),
        'importedCount' => count($activeVariationIds),
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
        'details' => $error->getMessage(),
    ]);
}