<?php

class Cache
{
    public static function has(string $key): bool
    {
        return is_file(self::path($key));
    }

    public static function get(string $key): mixed
    {
        return json_decode(file_get_contents(self::path($key)), true);
    }

    public static function put(string $key, mixed $value): void
    {
        file_put_contents(self::path($key), json_encode($value));
    }

    public static function remember(string $key, callable $callback): mixed
    {
        if (self::has($key)) {
            return self::get($key);
        }

        $value = $callback();

        self::put($key, $value);

        return $value;
    }

    private static function path(string $key): string
    {
        if (!is_dir(CACHE_PATH)) {
            mkdir(CACHE_PATH, 0755, true);
        }

        return CACHE_PATH . '/' . sha1($key) . '.json';
    }
}
