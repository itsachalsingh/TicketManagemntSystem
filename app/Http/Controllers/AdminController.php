<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Category;
use Inertia\Inertia;


class AdminController extends Controller
{



    public function index()
    {
        $tickets = Ticket::with(['user', 'assignedUser'])
            ->latest()
            ->get();

        $all_users = User::where('role_id', '!=', 1) // Exclude admins
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'tickets' => $tickets,
            'users' => $all_users
        ]);
    }

}
