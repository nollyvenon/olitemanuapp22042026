<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserManagementSeeder extends Seeder
{
    public function run(): void
    {
        // Create root groups
        $salesGroup = Group::create([
            'name' => 'Sales',
            'slug' => 'sales',
            'description' => 'Sales department',
            'created_by' => null,
        ]);

        $accountsGroup = Group::create([
            'name' => 'Accounts',
            'slug' => 'accounts',
            'description' => 'Accounts & finance',
            'created_by' => null,
        ]);

        $inventoryGroup = Group::create([
            'name' => 'Inventory',
            'slug' => 'inventory',
            'description' => 'Inventory management',
            'created_by' => null,
        ]);

        // Sub-groups (inherit from parent)
        Group::create([
            'name' => 'Regional Sales',
            'slug' => 'regional-sales',
            'description' => 'Regional sales team',
            'parent_id' => $salesGroup->id,
            'created_by' => null,
        ]);

        Group::create([
            'name' => 'Finance Team',
            'slug' => 'finance-team',
            'description' => 'Finance analysts',
            'parent_id' => $accountsGroup->id,
            'created_by' => null,
        ]);

        // Create admin user
        $admin = User::create([
            'email' => 'admin@omclta.local',
            'username' => 'admin',
            'password_hash' => Hash::make('admin123'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'is_active' => true,
            'is_sub_admin' => false,
        ]);

        // Create sub-admin (restricted to sales)
        $subAdmin = User::create([
            'email' => 'subadmin@omclta.local',
            'username' => 'subadmin',
            'password_hash' => Hash::make('subadmin123'),
            'first_name' => 'Sub',
            'last_name' => 'Admin',
            'is_active' => true,
            'is_sub_admin' => true,
            'sub_admin_parent_id' => $admin->id,
        ]);

        // Create regular users
        $salesUser = User::create([
            'email' => 'sales@omclta.local',
            'username' => 'sales_user',
            'password_hash' => Hash::make('sales123'),
            'first_name' => 'Sales',
            'last_name' => 'Agent',
            'is_active' => true,
        ]);

        $accountsUser = User::create([
            'email' => 'accountant@omclta.local',
            'username' => 'accountant',
            'password_hash' => Hash::make('account123'),
            'first_name' => 'Account',
            'last_name' => 'Manager',
            'is_active' => true,
        ]);

        $inventoryUser = User::create([
            'email' => 'inventory@omclta.local',
            'username' => 'inventory_mgr',
            'password_hash' => Hash::make('inv123'),
            'first_name' => 'Inventory',
            'last_name' => 'Manager',
            'is_active' => true,
        ]);

        // Assign users to groups
        $admin->groups()->attach($salesGroup);
        $admin->groups()->attach($accountsGroup);
        $admin->groups()->attach($inventoryGroup);

        $subAdmin->groups()->attach($salesGroup);
        $salesUser->groups()->attach($salesGroup);
        $accountsUser->groups()->attach($accountsGroup);
        $inventoryUser->groups()->attach($inventoryGroup);

        // Assign roles via groups
        $adminRole = Role::where('slug', 'admin')->first();
        $salesRole = Role::where('slug', 'sales-manager')->first();
        $accountantRole = Role::where('slug', 'accountant')->first();
        $inventoryRole = Role::where('slug', 'inventory-manager')->first();

        if ($adminRole) {
            $salesGroup->roles()->syncWithoutDetaching([$adminRole->id]);
            $accountsGroup->roles()->syncWithoutDetaching([$adminRole->id]);
            $inventoryGroup->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        if ($salesRole) {
            $salesGroup->roles()->syncWithoutDetaching([$salesRole->id]);
        }

        if ($accountantRole) {
            $accountsGroup->roles()->syncWithoutDetaching([$accountantRole->id]);
        }

        if ($inventoryRole) {
            $inventoryGroup->roles()->syncWithoutDetaching([$inventoryRole->id]);
        }
    }
}
