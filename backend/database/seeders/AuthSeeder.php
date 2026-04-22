<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Location;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AuthSeeder extends Seeder {
    public function run(): void {
        $this->seedLocations();
        $this->seedPermissions();
        $this->seedGroups();
        $this->seedUsers();
    }

    private function seedLocations(): void {
        Location::create(['name' => 'Lagos HQ', 'address' => 'Lagos, Nigeria', 'city' => 'Lagos', 'country' => 'Nigeria', 'lat' => 6.5244, 'long' => 3.3792]);
        Location::create(['name' => 'Abuja Office', 'address' => 'Abuja, Nigeria', 'city' => 'Abuja', 'country' => 'Nigeria', 'lat' => 9.0765, 'long' => 7.3986]);
        Location::create(['name' => 'Port Harcourt', 'address' => 'Port Harcourt, Nigeria', 'city' => 'Port Harcourt', 'country' => 'Nigeria', 'lat' => 4.8156, 'long' => 7.0498]);
    }

    private function seedPermissions(): void {
        $perms = [
            ['name' => 'users.read', 'module' => 'auth'],
            ['name' => 'users.create', 'module' => 'auth'],
            ['name' => 'users.update', 'module' => 'auth'],
            ['name' => 'users.delete', 'module' => 'auth'],
            ['name' => 'groups.read', 'module' => 'auth'],
            ['name' => 'groups.create', 'module' => 'auth'],
            ['name' => 'groups.update', 'module' => 'auth'],
            ['name' => 'admin.*', 'module' => 'admin'],
            ['name' => 'sales.orders.*', 'module' => 'sales'],
            ['name' => 'sales.invoices.read', 'module' => 'sales'],
            ['name' => 'inventory.*', 'module' => 'inventory'],
            ['name' => 'accounts.*', 'module' => 'accounts'],
            ['name' => 'kyc.*', 'module' => 'kyc'],
        ];
        foreach ($perms as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }
    }

    private function seedGroups(): void {
        $superAdmin = Group::create(['name' => 'Super Admin', 'description' => 'Full system access', 'is_active' => true]);
        $superAdmin->permissions()->attach(Permission::where('name', 'admin.*')->first()?->id);

        $salesMgr = Group::create(['name' => 'Sales Manager', 'description' => 'Sales management', 'is_active' => true]);
        $salesMgr->permissions()->attach([Permission::where('name', 'sales.orders.*')->first()?->id, Permission::where('name', 'sales.invoices.read')->first()?->id]);

        Group::create(['name' => 'Sales Officer', 'description' => 'Sales operations', 'is_active' => true]);
        Group::create(['name' => 'Store Manager', 'description' => 'Inventory management', 'is_active' => true]);
        Group::create(['name' => 'Accountant', 'description' => 'Accounting', 'is_active' => true]);
        Group::create(['name' => 'KYC Officer', 'description' => 'KYC verification', 'is_active' => true]);
    }

    private function seedUsers(): void {
        $locations = Location::all();

        $admin = User::create(['name' => 'System Admin', 'email' => 'superadmin@omclta.com', 'password_hash' => Hash::make('Admin@123456'), 'is_active' => true]);
        $admin->groups()->attach(Group::where('name', 'Super Admin')->first()?->id);
        $admin->locations()->attach($locations->pluck('id'));

        $salesMgr = User::create(['name' => 'Sales Manager', 'email' => 'sales.manager@omclta.com', 'password_hash' => Hash::make('SalesMgr@123'), 'is_active' => true]);
        $salesMgr->groups()->attach(Group::where('name', 'Sales Manager')->first()?->id);
        $salesMgr->locations()->attach($locations->first()?->id);

        $storeOps = User::create(['name' => 'Store Manager', 'email' => 'storemanager@omclta.com', 'password_hash' => Hash::make('StoreMgr@123'), 'is_active' => true]);
        $storeOps->groups()->attach(Group::where('name', 'Store Manager')->first()?->id);
        $storeOps->locations()->attach($locations->first()?->id);
    }
}
