<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$counterFile = 'visit_count.txt';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Increment counter
    $count = 0;
    if (file_exists($counterFile)) {
        $count = (int)file_get_contents($counterFile);
    }
    $count++;
    file_put_contents($counterFile, $count);
    echo json_encode(['count' => $count]);
} else {
    // Get current count
    $count = 0;
    if (file_exists($counterFile)) {
        $count = (int)file_get_contents($counterFile);
    }
    echo json_encode(['count' => $count]);
}
?>
