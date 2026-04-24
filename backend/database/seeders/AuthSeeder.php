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
            ['name' => 'sales.*', 'module' => 'sales'],
            ['name' => 'sales.orders.*', 'module' => 'sales'],
            ['name' => 'sales.invoices.read', 'module' => 'sales'],
            ['name' => 'inventory.*', 'module' => 'inventory'],
            ['name' => 'accounts.*', 'module' => 'accounts'],
            ['name' => 'reports.*', 'module' => 'reports'],
            ['name' => 'kyc.*', 'module' => 'kyc'],
        ];
        foreach ($perms as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }
    }

    private function seedGroups(): void {
        $p = fn(string $name) => Permission::where('name', $name)->first()?->id;

        $superAdmin = Group::firstOrCreate(['name' => 'Super Admin'], ['description' => 'Full system access', 'is_active' => true]);
        $superAdmin->permissions()->sync(Permission::pluck('id')->toArray());

        $salesMgr = Group::firstOrCreate(['name' => 'Sales Manager'], ['description' => 'Sales management', 'is_active' => true]);
        $salesMgr->permissions()->sync(array_filter([$p('sales.*'), $p('sales.orders.*'), $p('sales.invoices.read')]));

        $salesOfficer = Group::firstOrCreate(['name' => 'Sales Officer'], ['description' => 'Sales operations', 'is_active' => true]);
        $salesOfficer->permissions()->sync(array_filter([$p('sales.*')]));

        $storeMgr = Group::firstOrCreate(['name' => 'Store Manager'], ['description' => 'Inventory management', 'is_active' => true]);
        $storeMgr->permissions()->sync(array_filter([$p('inventory.*')]));

        $accountant = Group::firstOrCreate(['name' => 'Accountant'], ['description' => 'Accounting', 'is_active' => true]);
        $accountant->permissions()->sync(array_filter([$p('accounts.*')]));

        $kycOfficer = Group::firstOrCreate(['name' => 'KYC Officer'], ['description' => 'KYC verification', 'is_active' => true]);
        $kycOfficer->permissions()->sync(array_filter([$p('kyc.*')]));
    }

    private function seedUsers(): void {
        $locations = Location::all();

        $admin = User::firstOrCreate(['email' => 'superadmin@omclta.com'], ['name' => 'System Admin', 'password_hash' => Hash::make('Admin@123456'), 'is_active' => true]);
        $admin->groups()->sync([Group::where('name', 'Super Admin')->first()?->id]);
        $admin->locations()->sync($locations->pluck('id'));

        $salesMgr = User::firstOrCreate(['email' => 'sales.manager@omclta.com'], ['name' => 'Sales Manager', 'password_hash' => Hash::make('SalesMgr@123'), 'is_active' => true]);
        $salesMgr->groups()->sync([Group::where('name', 'Sales Manager')->first()?->id]);
        $salesMgr->locations()->sync($locations->first()?->id);

        $storeOps = User::firstOrCreate(['email' => 'storemanager@omclta.com'], ['name' => 'Store Manager', 'password_hash' => Hash::make('StoreMgr@123'), 'is_active' => true]);
        $storeOps->groups()->sync([Group::where('name', 'Store Manager')->first()?->id]);
        $storeOps->locations()->sync($locations->first()?->id);
    }
}
