<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CategoriesTableSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['id' => 1, 'name' => 'Technical', 'slug' => 'technical', 'description' => 'Technical-related grievances', 'parent_id' => null, 'is_active' => 1],
            ['id' => 2, 'name' => 'Support', 'slug' => 'support', 'description' => 'Support-related grievances', 'parent_id' => null, 'is_active' => 1],
            ['id' => 3, 'name' => 'Bug', 'slug' => 'bug', 'description' => 'Feature is not working as expected', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 4, 'name' => 'Login Issue', 'slug' => 'login-issue', 'description' => 'User is unable to log in', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 5, 'name' => 'Session Timeout', 'slug' => 'session-timeout', 'description' => 'System logs out too quickly or unexpectedly', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 6, 'name' => 'Form Submission Error', 'slug' => 'form-submission', 'description' => 'Form does not submit or throws validation errors', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 7, 'name' => 'Aadhar Verification Failed', 'slug' => 'aadhar-verification', 'description' => 'Aadhar verification process fails', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 8, 'name' => 'Captcha Not Loading', 'slug' => 'captcha-issue', 'description' => 'Captcha not loading or not working', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 9, 'name' => 'OTP Not Received', 'slug' => 'otp-issue', 'description' => 'One Time Password not received for verification', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 10, 'name' => 'Slow Performance', 'slug' => 'slow-performance', 'description' => 'Website or system is slow or laggy', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 11, 'name' => 'File Upload Issue', 'slug' => 'file-upload', 'description' => 'Files not uploading or getting rejected', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 12, 'name' => 'Mobile App Crash', 'slug' => 'app-crash', 'description' => 'Mobile application crashes on certain actions', 'parent_id' => 1, 'is_active' => 1],
            ['id' => 13, 'name' => 'SMS Issue', 'slug' => 'sms-issue', 'description' => 'SMS alerts or OTP not received', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 14, 'name' => 'Payment Failure', 'slug' => 'payment-failure', 'description' => 'Payment did not go through or not reflected', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 15, 'name' => 'Refund Delay', 'slug' => 'refund-delay', 'description' => 'Refund not initiated or delayed', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 16, 'name' => 'Marriage Service Problem', 'slug' => 'marriage-service', 'description' => 'Issues with marriage registration or certificate', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 17, 'name' => 'Service Not Assigned', 'slug' => 'service-not-assigned', 'description' => 'Requested service has not been assigned yet', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 18, 'name' => 'Verification Pending', 'slug' => 'verification-pending', 'description' => 'Verification not completed or stuck', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 19, 'name' => 'Language Translation Issue', 'slug' => 'language-issue', 'description' => 'Translation errors or local language not showing', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 20, 'name' => 'No Response From Support', 'slug' => 'no-support-response', 'description' => 'No resolution or delayed support response', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 21, 'name' => 'Wrong Information Displayed', 'slug' => 'wrong-info', 'description' => 'Incorrect details shown on screen or certificate', 'parent_id' => 2, 'is_active' => 1],
            ['id' => 22, 'name' => 'Grievance Not Closed', 'slug' => 'grievance-open', 'description' => 'Ticket marked as open even after resolution', 'parent_id' => 2, 'is_active' => 1],
        ];

        foreach ($categories as &$category) {
            $category['created_at'] = Carbon::now();
            $category['updated_at'] = Carbon::now();
        }

        DB::table('categories')->insert($categories);
    }
}
