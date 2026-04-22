<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class SalesSeeder extends Seeder {
    public function run(): void {
        $salesUser = User::where('email', 'sales.manager@omclta.com')->first();

        $customer1 = Customer::create([
            'name' => 'Acme Corporation',
            'email' => 'contact@acme.com',
            'phone' => '+234701234567',
            'company' => 'Acme Corp',
            'address' => '123 Business Ave',
            'city' => 'Lagos',
            'state' => 'Lagos',
            'country' => 'Nigeria',
            'created_by' => $salesUser->id,
        ]);

        $customer2 = Customer::create([
            'name' => 'Tech Solutions Ltd',
            'email' => 'sales@techsol.com',
            'phone' => '+234802345678',
            'company' => 'Tech Solutions',
            'address' => '456 Tech Park',
            'city' => 'Abuja',
            'state' => 'FCT',
            'country' => 'Nigeria',
            'created_by' => $salesUser->id,
        ]);

        $order1 = Order::create([
            'order_number' => 'ORD-' . now()->format('YmdHis'),
            'customer_id' => $customer1->id,
            'created_by' => $salesUser->id,
            'status' => 'confirmed',
            'order_date' => now(),
            'expected_delivery' => now()->addDays(7),
            'subtotal' => 50000,
            'tax' => 3750,
            'total' => 53750,
        ]);

        $order1->items()->create([
            'product_name' => 'Product A',
            'sku' => 'SKU-001',
            'quantity' => 10,
            'unit_price' => 5000,
            'total_price' => 50000,
        ]);
    }
}
