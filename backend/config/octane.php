<?php

return [
    'server' => env('OCTANE_SERVER', 'swoole'),
    'host' => env('OCTANE_HOST', '0.0.0.0'),
    'port' => env('OCTANE_PORT', 8000),
    'workers' => env('OCTANE_WORKERS', 4),
    'task_workers' => env('OCTANE_TASK_WORKERS', 6),
    'max_requests' => env('OCTANE_MAX_REQUESTS', 500),
    'memory_limit' => env('OCTANE_MEMORY_LIMIT', '512M'),
];
