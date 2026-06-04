<?php
declare(strict_types=1);

header('Content-Type: application/json');

$dsn = 'mysql:host=localhost;dbname=debra512_catalog;charset=utf8mb4';
$dbUser = 'debra512_catalog_user';
$dbPass = 'Xxth$k(NrSn*B8t2';

$category = $_GET['category'] ?? null;
$search = trim($_GET['search'] ?? '');
$page = max(1, (int)($_GET['page'] ?? 1));
$pageSize = min(100, max(1, (int)($_GET['pageSize'] ?? 24)));
$offset = ($page - 1) * $pageSize;

$where = [
    'visible = 1',
    'available = 1',
    'sell_price > 0'
];

$params = [];

if ($category) {
    $where[] = 'catalog_category = :category';
    $params[':category'] = $category;
}

if ($search !== '') {
    $where[] = '(description LIKE :search OR vendor_name LIKE :search OR vendor_part_number LIKE :search OR ingram_part_number LIKE :search)';
    $params[':search'] = '%' . $search . '%';
}

$whereSql = implode(' AND ', $where);

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM catalog_products WHERE $whereSql");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT
            ingram_part_number AS ingramPartNumber,
            vendor_part_number AS vendorPartNumber,
            upc,
            vendor_name AS vendorName,
            description,
            extra_description AS extraDescription,
            full_description AS fullDescription,
            category,
            sub_category AS subCategory,
            product_type AS productType,
            catalog_category AS catalogCategory,
            currency,
            sell_price AS sellPrice,
            available,
            total_availability AS totalAvailability,
            image_url AS imageUrl,
            thumbnail_url AS thumbnailUrl,
            brand_logo_url AS brandLogoUrl,
            gallery_urls AS galleryUrls
        FROM catalog_products
        WHERE $whereSql
        ORDER BY total_availability DESC, sell_price ASC
        LIMIT :limit OFFSET :offset
    ");

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['sellPrice'] = (float)$product['sellPrice'];
        $product['available'] = (bool)$product['available'];
        $product['totalAvailability'] = (int)$product['totalAvailability'];
        $product['galleryUrls'] = json_decode($product['galleryUrls'] ?? '[]', true) ?: [];
    }

    echo json_encode([
        'products' => $products,
        'page' => $page,
        'pageSize' => $pageSize,
        'total' => $total,
        'totalPages' => (int)ceil($total / $pageSize),
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'error' => 'Failed to load catalog products',
        'message' => $e->getMessage(),
    ]);
}