<?php

class Cache
{
    public static function remember(string $key, callable $callback): mixed
    {
        if (!is_dir(CACHE_PATH)) {
            mkdir(CACHE_PATH, 0755, true);
        }

        $path = CACHE_PATH . '/' . sha1($key) . '.json';

        if (is_file($path)) {
            return json_decode(file_get_contents($path), true);
        }

        $value = $callback();

        file_put_contents($path, json_encode($value));

        return $value;
    }
}
