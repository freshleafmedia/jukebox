<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\HtmlString;

class ResourceService
{
    public function resolvePath(string $path): string|HtmlString
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $manifestPath = public_path('/assets/manifest.json');

        if (is_file($manifestPath) === false) {
            throw new Exception('The resource manifest does not exist.');
        }

        $manifest = json_decode(file_get_contents($manifestPath), true, flags: \JSON_THROW_ON_ERROR);

        if (isset($manifest[$path]) === false) {
            $exception = new Exception("Unable to locate resource: {$path}.");

            if (! app('config')->get('app.debug')) {
                report($exception);

                return $path;
            }
            throw $exception;
        }

        return new HtmlString(str_replace('public/', '/', (string) $manifest[$path]));
    }
}
