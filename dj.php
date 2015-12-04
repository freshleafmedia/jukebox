<?php

error_reporting(E_ALL);
ini_set('display_errors', true);

echo "Adding ".$_GET['id'];

file_put_contents('playlist', $_GET['id'].PHP_EOL , FILE_APPEND);
