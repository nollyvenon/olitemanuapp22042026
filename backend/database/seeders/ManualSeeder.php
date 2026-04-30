<?php

namespace Database\Seeders;

use App\Models\Manual;
use App\Models\User;
use Illuminate\Database\Seeder;

class ManualSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first() ?? User::first();
        $createdBy = $admin?->id ?? 'system';

        $manuals = [
            ['title' => 'Getting Started', 'content' => '<h2>Welcome</h2><p>Learn the basics of the system and how to navigate the dashboard.</p>', 'module' => 'General', 'slug' => 'getting-started', 'roles' => null],
            ['title' => 'Dashboard Overview', 'content' => '<h2>Dashboard</h2><p>Understand your KPIs and metrics at a glance. The dashboard shows real-time data across all modules.</p>', 'module' => 'General', 'slug' => 'dashboard-overview', 'roles' => null],
            ['title' => 'Sales Orders', 'content' => '<h2>Managing Sales Orders</h2><p>Create, edit, and track customer orders through the sales pipeline. Authorize orders and generate invoices.</p>', 'module' => 'Sales', 'slug' => 'sales-orders', 'roles' => ['sales_officer', 'manager', 'admin']],
            ['title' => 'Customers', 'content' => '<h2>Customer Management</h2><p>Add and manage customer information, credit limits, and contact details. Assign customers to sales officers.</p>', 'module' => 'Sales', 'slug' => 'customers', 'roles' => ['sales_officer', 'manager', 'admin']],
            ['title' => 'Invoices', 'content' => '<h2>Invoice Management</h2><p>Generate, track, and manage customer invoices. Monitor payment status and collections.</p>', 'module' => 'Sales', 'slug' => 'invoices', 'roles' => ['sales_officer', 'manager', 'admin', 'accountant']],
            ['title' => 'Stock Items', 'content' => '<h2>Stock Management</h2><p>Maintain inventory of products. Track SKUs, costs, selling prices, and stock levels across locations.</p>', 'module' => 'Inventory', 'slug' => 'stock-items', 'roles' => ['inventory_officer', 'manager', 'admin']],
            ['title' => 'Stock Movements', 'content' => '<h2>Stock Adjustments</h2><p>Record inward goods, outward deliveries, and inventory adjustments. Maintain accurate stock ledger.</p>', 'module' => 'Inventory', 'slug' => 'stock-movements', 'roles' => ['inventory_officer', 'manager', 'admin']],
            ['title' => 'Inventory Reports', 'content' => '<h2>Inventory Reporting</h2><p>Generate opening/closing stock reports. Track inward and outward movements with detailed analytics.</p>', 'module' => 'Inventory', 'slug' => 'inventory-reports', 'roles' => ['inventory_officer', 'manager', 'admin', 'analyst']],
            ['title' => 'Chart of Accounts', 'content' => '<h2>Ledger Management</h2><p>Manage accounting ledgers. Record transactions, track account balances, and generate account statements.</p>', 'module' => 'Accounts', 'slug' => 'chart-accounts', 'roles' => ['accountant', 'manager', 'admin']],
            ['title' => 'Vouchers', 'content' => '<h2>Voucher Entry</h2><p>Record journal entries and vouchers. Support debit notes, credit notes, and other accounting transactions.</p>', 'module' => 'Accounts', 'slug' => 'vouchers', 'roles' => ['accountant', 'manager', 'admin']],
            ['title' => 'Financial Reports', 'content' => '<h2>Financial Reporting</h2><p>Generate financial statements, trial balance, and profit/loss reports for analysis and compliance.</p>', 'module' => 'Accounts', 'slug' => 'financial-reports', 'roles' => ['accountant', 'manager', 'admin']],
            ['title' => 'Revenue Intelligence', 'content' => '<h2>Revenue Analysis</h2><p>Analyze revenue by product, region, and officer. Track margins, growth trends, and identify leakage opportunities.</p>', 'module' => 'Analytics', 'slug' => 'revenue-intelligence', 'roles' => ['manager', 'admin', 'analyst']],
            ['title' => 'Sales Performance', 'content' => '<h2>Sales Analytics</h2><p>Monitor conversion rates, success rates, and individual officer performance. Identify training needs and top performers.</p>', 'module' => 'Analytics', 'slug' => 'sales-performance', 'roles' => ['manager', 'admin', 'analyst']],
            ['title' => 'User Management', 'content' => '<h2>Managing Users</h2><p>Add users, assign roles and locations, manage permissions. Control access to different modules and features.</p>', 'module' => 'Admin', 'slug' => 'user-management', 'roles' => ['admin']],
            ['title' => 'Roles & Permissions', 'content' => '<h2>Access Control</h2><p>Configure roles and assign permissions. Define what each user can access and what actions they can perform.</p>', 'module' => 'Admin', 'slug' => 'roles-permissions', 'roles' => ['admin']],
            ['title' => 'System Settings', 'content' => '<h2>Configuration</h2><p>Configure system-wide settings, business rules, and operational parameters for your organization.</p>', 'module' => 'Admin', 'slug' => 'system-settings', 'roles' => ['admin']],
        ];

        foreach ($manuals as $manual) {
            Manual::create([
                'title' => $manual['title'],
                'content' => $manual['content'],
                'module' => $manual['module'],
                'slug' => $manual['slug'],
                'roles_allowed' => $manual['roles'] ? json_encode($manual['roles']) : null,
                'created_by' => $createdBy,
            ]);
        }
    }
}
