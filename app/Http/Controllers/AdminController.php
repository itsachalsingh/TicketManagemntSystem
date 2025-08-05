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
            'latestTickets' => $tickets->take(5),
            'newUsersCount' => User::whereDate('created_at', now())->count(),
            'totalTickets' => $tickets->count(),
            'ticketStats' => [
                'open' => $tickets->where('status', 'open')->count(),
                'in_progress' => $tickets->where('status', 'in_progress')->count(),
                'resolved' => $tickets->where('status', 'resolved')->count(),
                'pending' => $tickets->where('status', 'pending')->count(),
            ],
            'priorityStats' => [
                'high' => $tickets->where('priority', 'high')->count(),
                'medium' => $tickets->where('priority', 'medium')->count(),
                'low' => $tickets->where('priority', 'low')->count(),
            ],
            'users' => $all_users
        ]);
    }

}
