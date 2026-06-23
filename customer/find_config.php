<?php
$dir = 'C:/xampp/htdocs/GitHub/Capstone--Development/';
$files = glob($dir . '**/config.php', GLOB_BRACE);
foreach (glob_recursive($dir) as $f) {
    if (basename($f) === 'config.php') echo $f . '<br>';
}

function glob_recursive($dir) {
    $files = [];
    foreach (glob($dir . '*') as $f) {
        $files[] = $f;
        if (is_dir($f)) $files = array_merge($files, glob_recursive($f . '/'));
    }
    return $files;
}
?>