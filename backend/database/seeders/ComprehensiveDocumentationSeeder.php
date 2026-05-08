<?php

namespace Database\Seeders;

use App\Models\Manual;
use App\Models\ManualCategory;
use Illuminate\Database\Seeder;

class ComprehensiveDocumentationSeeder extends Seeder {
    public function run(): void {
        $userGuide = ManualCategory::firstOrCreate(['slug' => 'user-guide'], ['name' => 'User Guide', 'description' => 'Daily operations', 'order' => 1]);
        $adminGuide = ManualCategory::firstOrCreate(['slug' => 'administration'], ['name' => 'Administration', 'description' => 'System management', 'order' => 2]);
        $workflows = ManualCategory::firstOrCreate(['slug' => 'workflows'], ['name' => 'Workflow Guides', 'description' => 'Step-by-step processes', 'order' => 3]);

        Manual::firstOrCreate(['slug' => 'financial-accounting'], [
            'category_id' => $userGuide->id,
            'title' => 'Financial Accounting & Vouchers',
            'content' => $this->getFinancialContent(),
            'excerpt' => 'Record financial transactions, create vouchers, and manage ledgers.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['voucher', 'ledger', 'accounting', 'financial'],
        ]);

        Manual::firstOrCreate(['slug' => 'kyc-process'], [
            'category_id' => $userGuide->id,
            'title' => 'KYC (Know Your Customer) Process',
            'content' => $this->getKYCContent(),
            'excerpt' => 'Submit and manage KYC verification for customers.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['kyc', 'customer', 'verification', 'compliance'],
        ]);

        Manual::firstOrCreate(['slug' => 'reporting-analytics'], [
            'category_id' => $userGuide->id,
            'title' => 'Reports & Analytics',
            'content' => $this->getReportsContent(),
            'excerpt' => 'Create and analyze business intelligence reports.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['reports', 'analytics', 'dashboard', 'insights'],
        ]);

        Manual::firstOrCreate(['slug' => 'inventory-configuration'], [
            'category_id' => $adminGuide->id,
            'title' => 'Inventory Configuration',
            'content' => $this->getInventoryConfigContent(),
            'excerpt' => 'Configure stock categories, pricing, and inventory rules.',
            'type' => 'admin',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['inventory', 'stock', 'configuration', 'categories'],
        ]);

        Manual::firstOrCreate(['slug' => 'workflow-approval-chains'], [
            'category_id' => $adminGuide->id,
            'title' => 'Configuring Approval Workflows',
            'content' => $this->getWorkflowContent(),
            'excerpt' => 'Set up approval chains and authorization rules.',
            'type' => 'admin',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['workflow', 'approval', 'authorization', 'chains'],
        ]);

        Manual::firstOrCreate(['slug' => 'multi-location-setup'], [
            'category_id' => $adminGuide->id,
            'title' => 'Multi-Location & Branch Setup',
            'content' => $this->getMultiLocationContent(),
            'excerpt' => 'Configure multiple locations and branch access control.',
            'type' => 'admin',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['location', 'branch', 'multi-location', 'setup'],
        ]);

        Manual::firstOrCreate(['slug' => 'end-to-end-sales-process'], [
            'category_id' => $workflows->id,
            'title' => 'End-to-End Sales Process',
            'content' => $this->getEndToEndSalesContent(),
            'excerpt' => 'Complete workflow from customer creation to invoice.',
            'type' => 'user',
            'status' => 'published',
            'created_by' => '550e8400-e29b-41d4-a716-446655440000',
            'published_at' => now(),
            'keywords' => ['sales', 'end-to-end', 'process', 'workflow'],
        ]);
    }

    private function getFinancialContent(): string {
        return <<<'HTML'
        <h2>Financial Accounting & Vouchers</h2>
        <p>Master the accounting module to record all financial transactions and maintain accurate ledgers.</p>

        <h3>Core Accounting Concepts</h3>
        <ul>
        <li><strong>Voucher:</strong> Document recording a debit/credit transaction</li>
        <li><strong>Ledger:</strong> Account that tracks cumulative balance</li>
        <li><strong>Journal Entry:</strong> Dual-sided transaction (debit = credit)</li>
        <li><strong>Trial Balance:</strong> Summary of all account balances</li>
        </ul>

        <h3>Creating a Voucher: Step-by-Step</h3>
        <ol>
        <li>Go to Accounts → Vouchers</li>
        <li>Click "+ New Voucher"</li>
        <li>Select voucher type (payment, receipt, journal)</li>
        <li>Select date and reference</li>
        <li>Add line items:
        <ul>
        <li>Debit account</li>
        <li>Credit account</li>
        <li>Amount (must balance)</li>
        </ul>
        </li>
        <li>Verify debit total = credit total</li>
        <li>Add description/notes</li>
        <li>Save as draft</li>
        <li>Submit for approval</li>
        </ol>

        <h3>Voucher Validation Rules</h3>
        <ul>
        <li>Total debits MUST equal total credits</li>
        <li>All accounts must be active</li>
        <li>Date cannot be in future</li>
        <li>Amount must be positive</li>
        </ul>

        <h3>Common Mistakes</h3>
        <ul>
        <li>❌ Unbalanced entries (debits ≠ credits)</li>
        <li>❌ Reversed debit/credit accounts</li>
        <li>❌ Wrong account selection</li>
        <li>❌ Duplicate entries</li>
        </ul>

        <h3>Best Practices</h3>
        <ul>
        <li>✅ Always verify amounts before submitting</li>
        <li>✅ Use clear descriptions for audit trail</li>
        <li>✅ Review balanced entries carefully</li>
        <li>✅ Keep supporting documentation</li>
        </ul>

        <h3>Permissions Required</h3>
        <ul>
        <li><code>accounts.create</code> - Create new vouchers</li>
        <li><code>accounts.submit</code> - Submit for approval</li>
        <li><code>accounts.approve</code> - Approve (manager only)</li>
        <li><code>accounts.view</code> - View ledgers</li>
        </ul>
        HTML;
    }

    private function getKYCContent(): string {
        return <<<'HTML'
        <h2>KYC (Know Your Customer) Process</h2>
        <p>Complete guide to customer verification and regulatory compliance.</p>

        <h3>Why KYC Matters</h3>
        <p>KYC is a regulatory requirement to verify customer identity and prevent fraud. Every customer must complete KYC before transactions.</p>

        <h3>KYC Status Flow</h3>
        <ol>
        <li><strong>Pending:</strong> Waiting for verification</li>
        <li><strong>Approved:</strong> Customer verified, can transact</li>
        <li><strong>Rejected:</strong> Compliance issue, requires resubmission</li>
        <li><strong>Expired:</strong> Renewal required</li>
        </ol>

        <h3>Submitting KYC: Step-by-Step</h3>
        <ol>
        <li>Go to KYC → Submit KYC</li>
        <li>Select or create customer</li>
        <li>Enter business details</li>
        <li>Enter owner information</li>
        <li>Upload ID document (PDF, JPG, PNG)</li>
        <li>Upload signed compliance form (optional)</li>
        <li>Review all information</li>
        <li>Submit for approval</li>
        </ol>

        <h3>Document Requirements</h3>
        <ul>
        <li>Identification: Valid government ID</li>
        <li>Business proof: Certificate, registration</li>
        <li>Address proof: Utility bill or lease</li>
        <li>Max file size: 5MB per document</li>
        <li>Formats: PDF, JPG, PNG only</li>
        </ul>

        <h3>Approval Process</h3>
        <p>KYC managers review submissions within 24-48 hours:</p>
        <ul>
        <li>Verify identity authenticity</li>
        <li>Check business registration</li>
        <li>Validate address</li>
        <li>Screen against compliance lists</li>
        <li>Approve or request corrections</li>
        </ul>

        <h3>Best Practices</h3>
        <ul>
        <li>✅ Submit clear, readable documents</li>
        <li>✅ Ensure all fields are complete</li>
        <li>✅ Use current, valid identification</li>
        <li>✅ Respond quickly to requests</li>
        </ul>
        HTML;
    }

    private function getReportsContent(): string {
        return <<<'HTML'
        <h2>Reports & Analytics</h2>
        <p>Generate insights and make data-driven decisions with powerful reporting.</p>

        <h3>Available Reports</h3>
        <ul>
        <li><strong>Sales Report:</strong> Revenue, orders, regional breakdown</li>
        <li><strong>Inventory Report:</strong> Stock levels, movements, costs</li>
        <li><strong>Ledger Report:</strong> Account balances, transactions</li>
        <li><strong>Customer Report:</strong> Top customers, segments, lifetime value</li>
        </ul>

        <h3>Creating a Custom Report</h3>
        <ol>
        <li>Go to Reports → Create Report</li>
        <li>Select report type</li>
        <li>Choose date range</li>
        <li>Select filters (location, customer, product)</li>
        <li>Choose columns to display</li>
        <li>Click "Generate"</li>
        <li>View or export results</li>
        </ol>

        <h3>AI Insights</h3>
        <p>Automated analysis of your data:</p>
        <ul>
        <li>Sales trends and forecasts</li>
        <li>Top-performing products</li>
        <li>Slow-moving inventory</li>
        <li>Customer concentration risk</li>
        <li>Margin analysis</li>
        </ul>

        <h3>Dashboard Widgets</h3>
        <p>Real-time visualizations of key metrics:</p>
        <ul>
        <li>Daily revenue</li>
        <li>Order count</li>
        <li>Inventory turnover</li>
        <li>Customer growth</li>
        <li>Accounts status</li>
        </ul>

        <h3>Exporting Reports</h3>
        <p>Download reports in multiple formats:</p>
        <ul>
        <li>CSV - Import to spreadsheet</li>
        <li>PDF - Print-ready format</li>
        <li>Excel - Full formatting and formulas</li>
        </ul>

        <h3>Permissions Required</h3>
        <ul>
        <li><code>reports.view</code> - View reports</li>
        <li><code>reports.create</code> - Create custom reports</li>
        <li><code>reports.export</code> - Download/export</li>
        </ul>
        HTML;
    }

    private function getInventoryConfigContent(): string {
        return <<<'HTML'
        <h2>Inventory Configuration</h2>
        <p>Set up stock categories, pricing rules, and inventory controls.</p>

        <h3>Stock Category Setup</h3>
        <ol>
        <li>Go to Admin → Inventory Configuration</li>
        <li>Click "+ New Category"</li>
        <li>Enter category name (e.g., Electronics)</li>
        <li>Set base margin percentage</li>
        <li>Configure tax rules</li>
        <li>Save category</li>
        </ol>

        <h3>Stock Item Configuration</h3>
        <ol>
        <li>Go to Inventory → Stock Items</li>
        <li>Click "+ New Item"</li>
        <li>Enter item details</li>
        <li>Set unit cost and selling price</li>
        <li>Configure minimum stock levels</li>
        <li>Add to category</li>
        <li>Activate item</li>
        </ol>

        <h3>Price List Management</h3>
        <p>Create tiered pricing based on volume:</p>
        <ol>
        <li>Go to Accounts → Price Lists</li>
        <li>Define pricing tiers (1-10 units, 11-50, etc.)</li>
        <li>Set margin or absolute price</li>
        <li>Apply to categories or specific items</li>
        <li>Set effective dates</li>
        </ol>

        <h3>Inventory Rules</h3>
        <ul>
        <li><strong>Minimum Stock:</strong> Alert when below threshold</li>
        <li><strong>Reorder Point:</strong> Auto-trigger purchase order</li>
        <li><strong>Maximum Stock:</strong> Prevent overstocking</li>
        <li><strong>Expiry Management:</strong> Track perishables</li>
        </ul>

        <h3>Unit Cost Management</h3>
        <p>Maintain accurate cost basis for margin calculation:</p>
        <ul>
        <li>Historical cost tracking</li>
        <li>FIFO valuation method</li>
        <li>Cost variance analysis</li>
        </ul>
        HTML;
    }

    private function getWorkflowContent(): string {
        return <<<'HTML'
        <h2>Configuring Approval Workflows</h2>
        <p>Set up authorization rules and approval chains for critical operations.</p>

        <h3>Workflow Basics</h3>
        <ul>
        <li>Define who can approve what</li>
        <li>Set conditions (amount, type, location)</li>
        <li>Enforce approval chain order</li>
        <li>Enable alternative approvers</li>
        </ul>

        <h3>Approval Matrix Setup</h3>
        <ol>
        <li>Go to Admin → Workflow Configuration</li>
        <li>Select operation (order approval, voucher, transfer)</li>
        <li>Define approval levels by amount</li>
        <li>Assign approvers by role</li>
        <li>Set escalation rules</li>
        <li>Save configuration</li>
        </ol>

        <h3>Order Approval Example</h3>
        <table border="1" cellpadding="10">
        <tr><th>Order Value</th><th>First Approver</th><th>Second Approver</th></tr>
        <tr><td>< 100,000</td><td>Senior Officer</td><td>None</td></tr>
        <tr><td>100,000 - 500,000</td><td>Manager</td><td>Regional Head</td></tr>
        <tr><td>> 500,000</td><td>Regional Head</td><td>Director</td></tr>
        </table>

        <h3>Override Rules</h3>
        <p>Allow exceptions with proper authorization:</p>
        <ul>
        <li>Emergency overrides (with audit trail)</li>
        <li>Exception approvers (director level)</li>
        <li>Time-limited permissions</li>
        <li>Logged reason requirement</li>
        </ul>

        <h3>Separation of Duties</h3>
        <p>Prevent conflicts of interest:</p>
        <ul>
        <li>Cannot create AND approve same order</li>
        <li>Cannot submit AND approve same voucher</li>
        <li>Exception: Director can override</li>
        </ul>
        HTML;
    }

    private function getMultiLocationContent(): string {
        return <<<'HTML'
        <h2>Multi-Location & Branch Setup</h2>
        <p>Configure multiple offices, warehouses, and regional operations.</p>

        <h3>Location Types</h3>
        <ul>
        <li><strong>Branch Office:</strong> Sales and administration</li>
        <li><strong>Warehouse:</strong> Inventory storage only</li>
        <li><strong>Distribution Center:</strong> Bulk inventory and shipping</li>
        <li><strong>Regional Hub:</strong> Multiple branch coordination</li>
        </ul>

        <h3>Adding a New Location</h3>
        <ol>
        <li>Go to Admin → Locations</li>
        <li>Click "+ New Location"</li>
        <li>Enter name and address</li>
        <li>Assign location manager</li>
        <li>Configure access permissions</li>
        <li>Set inventory/financial controls</li>
        <li>Activate location</li>
        </ol>

        <h3>Location Access Control</h3>
        <p>Users can only access their assigned locations:</p>
        <ul>
        <li>Users assigned to Lagos location see only Lagos data</li>
        <li>Data automatically filtered by location</li>
        <li>Cross-location access blocked unless authorized</li>
        </ul>

        <h3>Inter-Location Transfers</h3>
        <p>Move inventory between locations:</p>
        <ol>
        <li>Create transfer request</li>
        <li>Source location manager approves</li>
        <li>Destination location manager confirms receipt</li>
        <li>Inventory updated automatically</li>
        </ol>

        <h3>Consolidated Reporting</h3>
        <p>View data across all locations or specific location:</p>
        <ul>
        <li>Global dashboard (all locations)</li>
        <li>Location-specific dashboard</li>
        <li>Regional consolidated reports</li>
        </ul>
        HTML;
    }

    private function getEndToEndSalesContent(): string {
        return <<<'HTML'
        <h2>End-to-End Sales Process</h2>
        <p>Complete workflow from customer creation through invoice and payment.</p>

        <h3>Process Flow</h3>
        <ol>
        <li><strong>Customer Onboarding:</strong> Create customer record</li>
        <li><strong>KYC Verification:</strong> Submit and approve KYC</li>
        <li><strong>Sales Order:</strong> Create order for customer</li>
        <li><strong>Order Approval:</strong> Manager authorizes order</li>
        <li><strong>Invoice Generation:</strong> Create invoice from order</li>
        <li><strong>Payment Tracking:</strong> Record payments</li>
        <li><strong>Reconciliation:</strong> Match payments to invoices</li>
        </ol>

        <h3>Step 1: Customer Creation</h3>
        <ol>
        <li>Go to Sales → Customers</li>
        <li>Click "+ New Customer"</li>
        <li>Enter business name and details</li>
        <li>Add contact information</li>
        <li>Set credit limit and payment terms</li>
        <li>Assign to location/region</li>
        <li>Save customer</li>
        </ol>

        <h3>Step 2: KYC Submission</h3>
        <ol>
        <li>Go to KYC → Submit KYC</li>
        <li>Select newly created customer</li>
        <li>Upload required documents</li>
        <li>Submit for compliance review</li>
        <li>Wait for approval (24-48 hours)</li>
        </ol>

        <h3>Step 3: Sales Order Creation</h3>
        <ol>
        <li>Go to Sales → Orders</li>
        <li>Click "+ Create Order"</li>
        <li>Select verified customer</li>
        <li>Add products with quantities</li>
        <li>System calculates price from price list</li>
        <li>Apply any approved discounts</li>
        <li>Review total amount</li>
        <li>Save as draft</li>
        </ol>

        <h3>Step 4: Order Approval</h3>
        <ol>
        <li>Sales officer submits order</li>
        <li>Order goes to approval queue</li>
        <li>Manager reviews order</li>
        <li>Checks: customer verified, pricing correct, stock available</li>
        <li>Approves order (order becomes AUTHORIZED)</li>
        </ol>

        <h3>Step 5: Invoice Generation</h3>
        <ol>
        <li>Go to Sales → Invoices</li>
        <li>Click "+ New Invoice"</li>
        <li>Select authorized order</li>
        <li>System auto-fills from order</li>
        <li>Set payment terms and due date</li>
        <li>Save and send to customer</li>
        </ol>

        <h3>Step 6: Payment Recording</h3>
        <ol>
        <li>Customer makes payment</li>
        <li>Go to Accounts → Record Payment</li>
        <li>Select invoice</li>
        <li>Enter payment method and amount</li>
        <li>Save payment record</li>
        </ol>

        <h3>Timeline Summary</h3>
        <p>Typical transaction:</p>
        <ul>
        <li>Day 1: Customer creation</li>
        <li>Day 2-3: KYC approval</li>
        <li>Day 4: Sales order creation</li>
        <li>Same day: Order approval</li>
        <li>Day 5: Invoice sent</li>
        <li>Day 30-45: Payment received</li>
        <li>Day 45+: Payment reconciliation</li>
        </ul>
        HTML;
    }
}
