<?php
declare(strict_types=1);

header('Content-Type: application/json');

$IMPORT_TOKEN = 'CKrMI9uKpeA9pwLsyIPJekYJUbb67cOXcjM5Lr3gz1PIGedqPXCLHvIvXzHzXfCO';

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

$dsn = 'mysql:host=localhost;dbname=debra512_catalog;charset=utf8mb4';
$dbUser = 'debra512_catalog';
$dbPass = 'Xxth$k(NrSn*B8t2';

function mysqlDate(?string $iso): ?string {
    if (!$iso) {
        return null;
    }

    try {
        return (new DateTime($iso))->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return null;
    }
}

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

    foreach ($data['products'] as $product) {
        if (empty($product['ingramPartNumber'])) {
            continue;
        }

        $cost = (float)($product['cost'] ?? 0);
        $sellPrice = (float)($product['sellPrice'] ?? 0);

        if ($cost <= 0 || $sellPrice <= 0) {
            continue;
        }

        $upsertStmt->execute([
            ':ingram_part_number' => $product['ingramPartNumber'],
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
            ':image_url' => $product['imageUrl'] ?? null,
            ':thumbnail_url' => $product['thumbnailUrl'] ?? null,
            ':brand_logo_url' => $product['brandLogoUrl'] ?? null,
            ':gallery_urls' => json_encode($product['galleryUrls'] ?? []),
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

    // Hide products that were not in the latest successful import.
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
        'syncRunId' => $syncRunId,
        'imported' => $imported,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'error' => 'Import failed',
        'message' => $e->getMessage(),
    ]);
}