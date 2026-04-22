<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GodAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'godadmin1@omclta.com'],
            [
                'name' => 'God Admin 1',
                'password_hash' => Hash::make('GodAdmin@123456'),
                'is_active' => true,
                'is_god_admin' => true,
                'is_sub_admin' => false,
                'force_password_reset' => false,
            ]
        );

        User::firstOrCreate(
            ['email' => 'godadmin2@omclta.com'],
            [
                'name' => 'God Admin 2',
                'password_hash' => Hash::make('GodAdmin@123456'),
                'is_active' => true,
                'is_god_admin' => true,
                'is_sub_admin' => false,
                'force_password_reset' => false,
            ]
        );
    }
}
