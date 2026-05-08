<?php

namespace Database\Seeders;

use App\Models\Manual;
use App\Models\ManualCategory;
use Illuminate\Database\Seeder;

class DocumentationSeeder extends Seeder {
    public function run(): void {
        $userGuide = ManualCategory::firstOrCreate(['name' => 'User Guide'], ['slug' => 'user-guide', 'description' => 'Complete guide for daily ERP operations', 'order' => 1]);
        $adminGuide = ManualCategory::firstOrCreate(['name' => 'Administration'], ['slug' => 'administration', 'description' => 'System configuration and management', 'order' => 2]);

        Manual::firstOrCreate(['slug' => 'getting-started'], [
            'category_id' => $userGuide->id,
            'title' => 'Getting Started with OMCLTA ERP',
            'content' => $this->getStartContent(),
            'excerpt' => 'Learn the basics of accessing and navigating the OMCLTA ERP system.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['login', 'dashboard', 'navigation'],
        ]);

        Manual::firstOrCreate(['slug' => 'sales-orders'], [
            'category_id' => $userGuide->id,
            'title' => 'Creating and Managing Sales Orders',
            'content' => $this->getSalesContent(),
            'excerpt' => 'Step-by-step guide to creating, submitting, and managing sales orders.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['sales', 'orders', 'create', 'submit'],
        ]);

        Manual::firstOrCreate(['slug' => 'inventory-management'], [
            'category_id' => $userGuide->id,
            'title' => 'Inventory Management',
            'content' => $this->getInventoryContent(),
            'excerpt' => 'Manage stock, transfers, and inventory operations.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['inventory', 'stock', 'transfer', 'warehouse'],
        ]);

        Manual::firstOrCreate(['slug' => 'rbac-management'], [
            'category_id' => $adminGuide->id,
            'title' => 'RBAC Management and Access Control',
            'content' => $this->getRBACContent(),
            'excerpt' => 'Configure roles, groups, permissions, and access control.',
            'type' => 'admin',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['rbac', 'roles', 'groups', 'permissions'],
        ]);
    }

    private function getStartContent(): string {
        return <<<'HTML'
        <h2>Introduction to OMCLTA ERP</h2>
        <p>OMCLTA ERP is an enterprise resource planning system designed to streamline your business operations across sales, inventory, accounts, and reporting.</p>

        <h3>Why This System Matters</h3>
        <p>The ERP system centralizes data, enforces business rules, and ensures compliance across all operations. Every action is tracked for transparency and accountability.</p>

        <h3>Core Principles</h3>
        <ul>
        <li><strong>Transparency:</strong> All transactions are logged and auditable</li>
        <li><strong>Compliance:</strong> Built-in controls prevent errors and fraud</li>
        <li><strong>Efficiency:</strong> Automated workflows reduce manual work</li>
        <li><strong>Security:</strong> Role-based access controls protect sensitive data</li>
        </ul>

        <h3>Logging In</h3>
        <ol>
        <li>Navigate to the login page</li>
        <li>Enter your email and password</li>
        <li>You'll be redirected to your dashboard</li>
        </ol>

        <h3>Dashboard Overview</h3>
        <p>Your dashboard shows:</p>
        <ul>
        <li>Quick stats for your area</li>
        <li>Recent activities</li>
        <li>Pending approvals</li>
        <li>Navigation to all modules</li>
        </ul>
        HTML;
    }

    private function getSalesContent(): string {
        return <<<'HTML'
        <h2>Sales Orders: Complete Workflow</h2>
        <p>Learn how to create, submit, and manage sales orders in OMCLTA ERP.</p>

        <h3>When to Use Sales Orders</h3>
        <p>Create a sales order whenever a customer purchases products or services. The order records:</p>
        <ul>
        <li>Customer information</li>
        <li>Products/quantities</li>
        <li>Pricing and discounts</li>
        <li>Delivery details</li>
        <li>Payment terms</li>
        </ul>

        <h3>Step-by-Step: Creating a Sales Order</h3>
        <ol>
        <li>Navigate to Sales → Orders</li>
        <li>Click "+ Create Order"</li>
        <li>Select or create customer</li>
        <li>Add line items (products/quantities)</li>
        <li>Review pricing and terms</li>
        <li>Save as draft</li>
        <li>Click "Submit for Approval"</li>
        </ol>

        <h3>Order Statuses</h3>
        <ul>
        <li><strong>Draft:</strong> Not yet submitted</li>
        <li><strong>Submitted:</strong> Waiting for approval</li>
        <li><strong>Authorized:</strong> Approved, can be invoiced</li>
        <li><strong>Invoiced:</strong> Invoice created</li>
        </ul>

        <h3>Common Mistakes to Avoid</h3>
        <ul>
        <li>❌ Creating order with wrong customer</li>
        <li>❌ Submitting without verifying pricing</li>
        <li>❌ Ordering items out of stock (check availability first)</li>
        <li>❌ Forgetting payment terms</li>
        </ul>

        <h3>Best Practices</h3>
        <ul>
        <li>✅ Always verify customer details before submitting</li>
        <li>✅ Check inventory availability</li>
        <li>✅ Review all discounts with manager approval</li>
        <li>✅ Save orders as draft before final submission</li>
        </ul>
        HTML;
    }

    private function getInventoryContent(): string {
        return <<<'HTML'
        <h2>Inventory Management</h2>
        <p>Master inventory operations: stock transfers, adjustments, and reporting.</p>

        <h3>Core Inventory Concepts</h3>
        <ul>
        <li><strong>Stock Items:</strong> Individual products in your inventory</li>
        <li><strong>Stock Journals:</strong> Records of all inventory movements</li>
        <li><strong>Transfers:</strong> Move stock between locations</li>
        <li><strong>Adjustments:</strong> Correct inventory counts</li>
        </ul>

        <h3>Checking Stock Availability</h3>
        <ol>
        <li>Go to Inventory → Stock Items</li>
        <li>Search for product by SKU or name</li>
        <li>View available quantity and location</li>
        <li>Check minimum stock level</li>
        </ol>

        <h3>Transferring Stock Between Locations</h3>
        <ol>
        <li>Go to Inventory → Stock Transfers</li>
        <li>Click "+ New Transfer"</li>
        <li>Select source location</li>
        <li>Select destination location</li>
        <li>Add items and quantities</li>
        <li>Save and submit for approval</li>
        <li>Manager approves transfer</li>
        <li>System updates stock in both locations</li>
        </ol>

        <h3>Inventory Adjustments</h3>
        <p>Use adjustments when physical count differs from system records.</p>
        <ol>
        <li>Count physical inventory</li>
        <li>Go to Inventory → Adjustments</li>
        <li>Enter current system quantity</li>
        <li>Enter actual physical quantity</li>
        <li>System calculates variance</li>
        <li>Submit for approval</li>
        </ol>

        <h3>Permissions Required</h3>
        <ul>
        <li>View stock: <code>inventory.view</code></li>
        <li>Create transfer: <code>inventory.transfer</code></li>
        <li>Approve transfer: <code>inventory.approve</code> (Manager only)</li>
        </ul>
        HTML;
    }

    private function getRBACContent(): string {
        return <<<'HTML'
        <h2>RBAC Management: Controlling Access</h2>
        <p>Configure roles, groups, and permissions to control who can access what.</p>

        <h3>Core Concept: Users → Groups → Permissions</h3>
        <p>Users NEVER get permissions directly. Instead:</p>
        <ul>
        <li>Assign users to <strong>groups</strong></li>
        <li>Grant <strong>permissions</strong> to groups</li>
        <li>Users inherit all group permissions</li>
        <li>Permissions automatically merge across multiple groups</li>
        </ul>

        <h3>Creating a Group</h3>
        <ol>
        <li>Go to Admin → Roles & Groups</li>
        <li>Click "+ Create Group"</li>
        <li>Enter group name (e.g., "Sales Team")</li>
        <li>Add description</li>
        <li>Click "Create"</li>
        </ol>

        <h3>Assigning Permissions to a Group</h3>
        <ol>
        <li>Go to Admin → Roles & Groups</li>
        <li>Find the group</li>
        <li>Click "Manage Permissions"</li>
        <li>Check permissions for each module</li>
        <li>Click "Save Permissions"</li>
        </ol>

        <h3>Adding Users to a Group</h3>
        <ol>
        <li>Go to Admin → Users</li>
        <li>Find the user</li>
        <li>Click "Edit Groups"</li>
        <li>Select groups to assign</li>
        <li>Click "Save"</li>
        </ol>

        <h3>Permission Naming Convention</h3>
        <p>All permissions follow: <code>module.action</code></p>
        <ul>
        <li><code>sales.create</code> - Can create sales orders</li>
        <li><code>sales.approve</code> - Can approve orders</li>
        <li><code>inventory.transfer</code> - Can transfer stock</li>
        <li><code>admin.*</code> - All admin permissions</li>
        </ul>

        <h3>Important Rules</h3>
        <ul>
        <li>⚠️ Users cannot receive permissions directly</li>
        <li>⚠️ A user needs explicit permission to perform ANY action</li>
        <li>⚠️ Absence of permission = no access (default deny)</li>
        <li>⚠️ All changes are logged for audit</li>
        </ul>
        HTML;
    }
}
