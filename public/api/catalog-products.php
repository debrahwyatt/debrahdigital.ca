<?php

declare(strict_types=1);

$allowedOrigins = [
    'https://debrahdigital.ca',
    'https://www.debrahdigital.ca',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
} else {
    header('Access-Control-Allow-Origin: https://debrahdigital.ca');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function sendJson(int $statusCode, array $payload): void {
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(405, [
        'success' => false,
        'error' => 'Method not allowed',
    ]);
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

function cleanQueryString(mixed $value): string {
    return trim((string)($value ?? ''));
}

function normalizePartNumber(string $value): string {
    return strtoupper(trim($value));
}

function getCatalogDatabaseName(string $dbProd, string $dbDev): string {
    $requestedEnvironment = strtolower(trim((string)($_GET['environment'] ?? '')));

    if ($requestedEnvironment === 'development' || $requestedEnvironment === 'dev') {
        return $dbDev;
    }

    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');

    if (
        str_starts_with($host, 'dev.') ||
        str_contains($host, 'localhost') ||
        str_contains($host, '127.0.0.1')
    ) {
        return $dbDev;
    }

    return $dbProd;
}

function getEnvironmentFromDatabaseName(string $dbName): string {
    return str_ends_with($dbName, '_dev') ? 'development' : 'production';
}

function decodeJsonArray(mixed $value): array {
    if ($value === null || $value === '') {
        return [];
    }

    if (is_array($value)) {
        return $value;
    }

    $decoded = json_decode((string)$value, true);

    return is_array($decoded) ? $decoded : [];
}

function normalizeProductRow(array $product): array {
    $product['cost'] = isset($product['cost'])
        ? (float)$product['cost']
        : null;

    $product['sellPrice'] = isset($product['sellPrice'])
        ? (float)$product['sellPrice']
        : null;

    $product['available'] = (bool)$product['available'];
    $product['visible'] = (bool)$product['visible'];

    $product['totalAvailability'] = (int)($product['totalAvailability'] ?? 0);

    $product['icecatMatched'] = (bool)$product['icecatMatched'];

    if ($product['icecatId'] !== null) {
        $product['icecatId'] = is_numeric($product['icecatId'])
            ? (int)$product['icecatId']
            : $product['icecatId'];
    }

    $product['galleryUrls'] = decodeJsonArray($product['galleryUrls'] ?? null);
    $product['features'] = decodeJsonArray($product['features'] ?? null);
    $product['specifications'] = decodeJsonArray($product['specifications'] ?? null);

    return $product;
}

$config = loadCatalogConfig();

$dbHost = (string)$config['CATALOG_DB_HOST'];
$dbUser = (string)$config['CATALOG_DB_USER'];
$dbPass = (string)$config['CATALOG_DB_PASS'];
$dbProd = (string)$config['CATALOG_DB_PROD'];
$dbDev = (string)$config['CATALOG_DB_DEV'];

$dbName = getCatalogDatabaseName($dbProd, $dbDev);

$category = cleanQueryString($_GET['category'] ?? null);
$search = cleanQueryString($_GET['search'] ?? '');
$sort = cleanQueryString($_GET['sort'] ?? 'price-low');
$ingramPartNumber = cleanQueryString($_GET['ingramPartNumber'] ?? '');

$page = max(1, (int)($_GET['page'] ?? 1));
$pageSize = min(100, max(1, (int)($_GET['pageSize'] ?? 24)));

$isDetailLookup = $ingramPartNumber !== '';

if ($isDetailLookup) {
    $page = 1;
    $pageSize = 1;
}

$offset = ($page - 1) * $pageSize;

$where = [
    'visible = 1',
    'available = 1',
    'sell_price > 0',
];

$params = [];

if ($isDetailLookup) {
    $where[] = 'UPPER(TRIM(ingram_part_number)) = :ingram_part_number';
    $params[':ingram_part_number'] = normalizePartNumber($ingramPartNumber);
} else {
    if ($category !== '' && $category !== 'all') {
        $where[] = 'catalog_category = :category';
        $params[':category'] = $category;
    }

    if ($search !== '') {
        $where[] = '(
            description LIKE :search
            OR extra_description LIKE :search
            OR full_description LIKE :search
            OR vendor_name LIKE :search
            OR vendor_part_number LIKE :search
            OR ingram_part_number LIKE :search
            OR upc LIKE :search
            OR category LIKE :search
            OR sub_category LIKE :search
            OR product_type LIKE :search
            OR catalog_category LIKE :search
        )';

        $params[':search'] = '%' . $search . '%';
    }
}

$whereSql = implode(' AND ', $where);

if ($isDetailLookup) {
    $orderSql = 'ingram_part_number ASC';
} else {
    switch ($sort) {
        case 'price-high':
            $orderSql = 'sell_price DESC, description ASC';
            break;

        case 'za':
            $orderSql = 'description DESC';
            break;

        case 'az':
            $orderSql = 'description ASC';
            break;

        case 'availability':
            $orderSql = 'total_availability DESC, sell_price ASC, description ASC';
            break;

        case 'price-low':
        default:
            $orderSql = 'sell_price ASC, description ASC';
            break;
    }
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

    $countStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM catalog_products
        WHERE {$whereSql}
    ");

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
            cost,
            sell_price AS sellPrice,

            available,
            total_availability AS totalAvailability,

            image_url AS imageUrl,
            thumbnail_url AS thumbnailUrl,
            brand_logo_url AS brandLogoUrl,
            gallery_urls AS galleryUrls,

            features,
            specifications,

            visible,

            icecat_id AS icecatId,
            icecat_matched AS icecatMatched,
            icecat_matched_by AS icecatMatchedBy,
            icecat_last_checked_at AS icecatLastCheckedAt,

            source_last_synced_at AS lastSyncedAt
        FROM catalog_products
        WHERE {$whereSql}
        ORDER BY {$orderSql}
        LIMIT :limit OFFSET :offset
    ");

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $products = array_map(
        'normalizeProductRow',
        $stmt->fetchAll(),
    );

    echo json_encode([
        'success' => true,
        'products' => $products,
        'page' => $page,
        'pageSize' => $pageSize,
        'total' => $total,
        'totalPages' => max(1, (int)ceil($total / $pageSize)),
        'environment' => getEnvironmentFromDatabaseName($dbName),
        'database' => $dbName,
    ]);
} catch (Throwable $error) {
    sendJson(500, [
        'success' => false,
        'error' => 'Failed to load catalog products',
        'environment' => getEnvironmentFromDatabaseName($dbName ?? ''),
        'database' => $dbName ?? null,
        'details' => $error->getMessage(),
    ]);
}