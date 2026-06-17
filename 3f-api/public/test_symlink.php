<?php
header('Content-Type: text/plain');
echo "Current directory: " . getcwd() . "\n";
echo "Files:\n";
foreach (scandir('.') as $file) {
    $isLink = is_link($file) ? " (LINK -> " . readlink($file) . ")" : "";
    $type = is_dir($file) ? "DIR" : "FILE";
    echo "- $file [$type]$isLink\n";
}
if (file_exists('storage')) {
    echo "storage exists!\n";
    echo "storage is_dir: " . (is_dir('storage') ? 'yes' : 'no') . "\n";
    echo "storage target: " . (is_link('storage') ? readlink('storage') : 'not a link') . "\n";
} else {
    echo "storage does NOT exist under public!\n";
}
