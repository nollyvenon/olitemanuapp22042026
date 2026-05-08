<?php

namespace App\Modules\Documentation\Services;

use App\Models\ContextualHelp;
use App\Models\Manual;

class ContextualHelpService {
    private array $helpMapping = [
        '/dashboard' => 'getting-started',
        '/sales' => 'sales-orders',
        '/sales/orders' => 'sales-orders',
        '/inventory' => 'inventory-management',
        '/inventory/stock' => 'inventory-management',
        '/accounts' => 'financial-accounting',
        '/kyc' => 'kyc-process',
        '/reports' => 'reporting-analytics',
        '/dashboard/admin/users' => 'rbac-management',
        '/dashboard/admin/roles' => 'rbac-management',
        '/dashboard/admin/groups' => 'rbac-management',
        '/dashboard/admin/permissions' => 'rbac-management',
    ];

    public function getHelpForPage(string $route): ?Manual {
        $slug = $this->helpMapping[$route] ?? null;
        if (!$slug) return null;
        return Manual::where('slug', $slug)->where('status', 'published')->first();
    }

    public function registerMapping(string $route, string $manualSlug): void {
        $this->helpMapping[$route] = $manualSlug;
    }

    public function getAllMappings(): array {
        return $this->helpMapping;
    }
}
