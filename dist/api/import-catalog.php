<?php
declare(strict_types=1);

header('Content-Type: application/json');

$IMPORT_TOKEN = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

$providedToken = $_SERVER['HTTP_X_CATALOG_IMPORT_TOKEN'] ?? '';

if (!hash_equals($IMPORT_TOKEN, $providedToken)) {
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
        'error' => 'Missing JSON body',
    ]);
    exit;
}

$data = json_decode($rawBody, true);

if (!is_array($data) || !isset($data['products']) || !is_array($data['products'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid catalog JSON',
    ]);
    exit;
}

$dbUser = 'debrah512_catalog_user';
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
        ? 'debrah512_catalog_dev'
        : 'debrah512_catalog';
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

$dbName = getCatalogDatabaseName();
$dsn = "mysql:host=localhost;dbname={$dbName};charset=utf8mb4";