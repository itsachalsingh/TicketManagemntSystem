<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'super_admin@example.com'],
            ['name' => 'Super Admin', 'password' => bcrypt('password'), 'phone' => '1234567890', 'role_id' => 1]

        );
        User::firstOrCreate(['email' => 'admin@example.com'], ['name' => 'Admin', 'password' => bcrypt('password'), 'phone' => '1234567891', 'role_id' => 2]);
        User::firstOrCreate(['email' => 'support_agent@example.com'], ['name' => 'Support Agent', 'password' => bcrypt('password'), 'phone' => '1234567892', 'role_id' => 3]);
        User::firstOrCreate(['email' => 'user@example.com'], ['name' => 'User', 'password' => bcrypt('password'), 'phone' => '1234567893', 'role_id' => 4]);
    }
}
