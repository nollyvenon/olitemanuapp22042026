<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController
{
    public function index(): JsonResponse
    {
        $permissions = Permission::all();
        return response()->json($permissions);
    }
}
