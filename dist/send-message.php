<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "info@debrahdigital.ca";
    $subject = "Message from " . htmlspecialchars($_POST["name"]);
    $message = "Name: " . $_POST["name"] . "\n";
    $message .= "Email: " . $_POST["email"] . "\n";
    $message .= "Subject: " . $_POST["subject"] . "\n\n";
    $message .= "Message:\n" . $_POST["message"];

    $headers = "From: " . $_POST["email"];

    if (mail($to, $subject, $message, $headers)) {
        header("Location: https://www.debrahdigital.ca/success");
        exit();
    } else {
        header("Location: https://www.debrahdigital.ca/error");
        exit();
    }
} else {
    echo "Invalid request.";
}
?>