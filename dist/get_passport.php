<?php
// --- Database credentials (use your actual values from cPanel) ---
$host = "localhost";                       // 'localhost' works for PHP running on same host
$db   = "debra512_Digital_Passport";       // full database name with prefix
$user = "debra512_admin";                  // MySQL user
$pass = "Cheeky_1987";                // MySQL user's password

header('Content-Type: application/json');

// --- Connect using PDO for security and simplicity ---
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
    exit;
}

// --- Query: adjust field name if it's not actually called 'passport_id' ---
try {
    $stmt = $pdo->query("SELECT user_id AS passport_id FROM transactions LIMIT 1");
    $row = $stmt->fetch();

    if ($row) {
        echo json_encode($row);
    } else {
        echo json_encode(["passport_id" => null]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed", "details" => $e->getMessage()]);
}
?>
