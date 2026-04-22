<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Location;
use App\Models\Customer;
use App\Models\LedgerAccount;
use App\Models\Territory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@omclta.com'],
            [
                'name' => 'Super Admin',
                'password_hash' => Hash::make('SuperAdmin@123456'),
                'is_active' => true,
                'is_god_admin' => false,
                'is_sub_admin' => true,
                'force_password_reset' => false,
            ]
        );

        $locations = [
            ['name' => 'Lagos HQ', 'address' => 'VI, Lagos', 'city' => 'Lagos', 'state' => 'Lagos', 'country' => 'Nigeria', 'lat' => 6.5244, 'long' => 3.3792],
            ['name' => 'Abuja Office', 'address' => 'Wuse, Abuja', 'city' => 'Abuja', 'state' => 'FCT', 'country' => 'Nigeria', 'lat' => 9.0765, 'long' => 7.3986],
        ];

        foreach ($locations as $loc) {
            Location::firstOrCreate(['name' => $loc['name']], $loc);
        }

        $customers = [
            ['name' => 'Dangote Group', 'email' => 'contact@dangote.com', 'phone' => '0800111111', 'created_by' => $superAdmin->id],
            ['name' => 'BUA Group', 'email' => 'contact@bua.com', 'phone' => '0800222222', 'created_by' => $superAdmin->id],
            ['name' => 'MTN Nigeria', 'email' => 'procurement@mtn.com', 'phone' => '0800333333', 'created_by' => $superAdmin->id],
        ];

        foreach ($customers as $cust) {
            Customer::firstOrCreate(['email' => $cust['email']], $cust);
        }

    }
}
