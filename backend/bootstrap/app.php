<?php

$app = new Illuminate\Foundation\Application(dirname(__DIR__));

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class,
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class,
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    Illuminate\Foundation\Exceptions\Handler::class,
);

// Register config repository early
$app->singleton('config', function ($app) {
    return new Illuminate\Config\Repository();
});

// Load all config files into the repository
$configPath = dirname(__DIR__) . '/config';
if (is_dir($configPath)) {
    foreach (glob($configPath . '/*.php') as $file) {
        $configKey = basename($file, '.php');
        $app['config'][$configKey] = require $file;
    }
}

// Register service providers
$config = require dirname(__DIR__) . '/config/app.php';
foreach ($config['providers'] as $provider) {
    $app->register($provider);
}

return $app;
