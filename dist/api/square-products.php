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

function loadShopConfig(): array {
    $configPath = __DIR__ . '/../../dds-shop-config.env';

    if (!is_readable($configPath)) {
        sendJson(500, [
            'success' => false,
            'error' => 'Server configuration error',
            'message' => 'Shop configuration file is missing or not readable.',
        ]);
    }

    $config = parse_ini_file($configPath, false, INI_SCANNER_RAW);

    if ($config === false) {
        sendJson(500, [
            'success' => false,
            'error' => 'Server configuration error',
            'message' => 'Shop configuration file could not be parsed.',
        ]);
    }

    $requiredKeys = [
        'SHOP_DB_HOST',
        'SHOP_DB_USER',
        'SHOP_DB_PASS',
        'SHOP_DB_PROD',
        'SHOP_DB_DEV',
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

$config = loadShopConfig();

$dbHost = (string)$config['SHOP_DB_HOST'];
$dbUser = (string)$config['SHOP_DB_USER'];
$dbPass = (string)$config['SHOP_DB_PASS'];
$dbProd = (string)$config['SHOP_DB_PROD'];
$dbDev = (string)$config['SHOP_DB_DEV'];

function getShopDatabaseName(string $dbProd, string $dbDev): string {
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

$dbName = getShopDatabaseName($dbProd, $dbDev);

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

    $stmt = $pdo->query("
        SELECT
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
        FROM square_products
        WHERE sellable = 1
          AND sold_out = 0
          AND quantity > 0
        ORDER BY name ASC
    ");

    $rows = $stmt->fetchAll();

    $products = array_map(function (array $row): array {
        $imageIds = json_decode((string)$row['image_ids_json'], true);

        if (!is_array($imageIds)) {
            $imageIds = [];
        }

        return [
            'id' => (string)$row['square_id'],
            'variationId' => (string)$row['variation_id'],

            'name' => (string)$row['name'],
            'description' => (string)$row['description'],

            'priceCents' => (int)$row['price_cents'],
            'price' => (float)$row['price'],
            'currency' => (string)$row['currency'],

            'sku' => $row['sku'] !== null ? (string)$row['sku'] : null,

            'imageIds' => $imageIds,
            'primaryImageId' => $row['primary_image_id'] !== null
                ? (string)$row['primary_image_id']
                : null,
            'imageUrl' => $row['image_url'] !== null
                ? (string)$row['image_url']
                : null,

            'categoryId' => (string)$row['category_id'],
            'categoryName' => (string)$row['category_name'],

            'trackInventory' => (bool)$row['track_inventory'],
            'stockable' => (bool)$row['stockable'],
            'sellable' => (bool)$row['sellable'],
            'soldOut' => (bool)$row['sold_out'],

            'inventoryAlertThreshold' => $row['inventory_alert_threshold'] !== null
                ? (int)$row['inventory_alert_threshold']
                : null,

            'quantity' => (int)$row['quantity'],

            'updatedAt' => (string)$row['square_updated_at'],
            'exportedAt' => (string)$row['exported_at'],
            'importedAt' => (string)$row['imported_at'],
        ];
    }, $rows);

    echo json_encode([
        'products' => $products,
        'total' => count($products),
        'environment' => getEnvironmentFromDatabaseName($dbName),
        'database' => $dbName,
    ]);
} catch (Throwable $error) {
    sendJson(500, [
        'success' => false,
        'error' => 'Failed to load Square products',
        'environment' => getEnvironmentFromDatabaseName($dbName ?? ''),
        'database' => $dbName ?? null,
        'details' => $error->getMessage(),
    ]);
}