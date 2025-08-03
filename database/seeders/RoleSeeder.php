<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         Role::firstOrCreate(['name' => 'super_admin'], ['label' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'admin'], ['label' => 'Admin']);
        Role::firstOrCreate(['name' => 'support_agent'], ['label' => 'Support Agent']);
        Role::firstOrCreate(['name' => 'user'], ['label' => 'User']);
    }
}
