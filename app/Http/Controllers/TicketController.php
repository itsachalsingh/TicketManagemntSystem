<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\Rule;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;



class TicketController extends Controller
{

    //
    public function index()
    {
        $tickets = Ticket::with(['user'])->where('user_id', Auth::id())->get();
        return Inertia::render('Dashboard', [
            'tickets' => $tickets,
        ]);
    }

    public function show($id)
    {
        // Logic to display a specific ticket
        $ticket = Ticket::with(['user', 'assignedUser'])->find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }
        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function create()
    {
        // Logic to show the form for creating a new ticket
        return Inertia::render('Tickets/Create');
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        // Validation rules
        $validated = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'phone' => 'required|string|max:20',

            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|string|in:low,medium,high',
            'category' => 'required|string|max:100',
            'sub_category' => 'nullable|string|max:100',
        ])->validate();

        // Determine which user ID to assign to the ticket
        if ($authUser->role_id == 4) {
            // Role ID 4: use current logged-in user ID
            $userId = $authUser->id;

            // Update missing user details if not already saved
            foreach (['name', 'email', 'phone'] as $field) {
                if (empty($authUser->$field) && $request->filled($field)) {
                    $authUser->$field = $request->input($field);
                }
            }

            if ($authUser->isDirty()) {
                $authUser->save();
            }
        } else {
            // For other roles: create or find the user based on email
            $user = \App\Models\User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'password' => bcrypt(Str::random(10)), // generate random password
                    'role_id' => 4, // assign 'user' role
                ]
            );

            $userId = $user->id;
        }

        // Create the ticket
        $ticket = \App\Models\Ticket::create([
            'user_id' => $userId,
            'title' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'category' => $validated['category'],
            'sub_category' => $validated['sub_category'] ?? null,
        ]);

        return redirect()->route('tickets.show', $ticket->id)->with('success', 'Ticket created successfully.');
    }

    public function edit($id)
    {
        // Logic to show the form for editing a specific ticket
        $ticket = Ticket::with(['user', 'assignedUser'])->find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }
        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Logic to update a specific ticket
        $ticket = Ticket::with(['user', 'assignedUser'])->find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $validated = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_user_id' => 'nullable|exists:users,id',
        ])->validate();

        $ticket->update($validated);

        return redirect()->route('tickets.show', $ticket->id);
    }

    public function destroy($id)
    {
        // Logic to delete a specific ticket
        $ticket = Ticket::with(['user', 'assignedUser'])->find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $ticket->delete();

        return redirect()->route('tickets.index');
    }

    public function assign(Request $request, $id)
    {
        // Logic to assign a ticket to a user
        $ticket = Ticket::find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $validated = Validator::make($request->all(), [
            'assigned_to' => 'required|exists:users,id',
        ])->validate();

        $ticket->update(['assigned_to' => $validated['assigned_to']]);

        return redirect()->route('tickets.show', $ticket->id);
    }
}
