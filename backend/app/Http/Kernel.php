<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
    ];

    protected $middlewareGroups = [
        'api' => [],
    ];

    protected $middlewareAliases = [
        'jwt' => \App\Modules\Auth\Http\Middleware\JwtMiddleware::class,
        'god_admin' => \App\Modules\GodAdmin\Http\Middleware\IssueGodAdminMiddleware::class,
    ];
}

