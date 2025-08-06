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
use Illuminate\Support\Facades\Http;
use App\Models\Category;



class TicketController extends Controller
{


    public function index()
    {
        $user = Auth::user();

        if($user->role_id == 4) {
            $tickets = Ticket::with(['user'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

            return Inertia::render('Dashboard', [
                'tickets' => $tickets,
                'user' => $user,
            ]);
        } elseif ($user->role_id == 3) {
            $tickets = Ticket::with(['user', 'assignedUser'])
                ->where(function ($query) use ($user) {
                    $query->where('created_by', $user->id)
                        ->orWhere('assigned_to', $user->id);
                })
                ->latest()
                ->get();

            return Inertia::render('Dashboard', [
                'tickets' => $tickets,
                'user' => $user,
            ]);
        } else {
            $tickets = Ticket::with(['user', 'assignedUser'])
            ->latest()
            ->get();

            return Inertia::render('Dashboard', [
                'tickets' => $tickets,
                'user' => $user,
            ]);
        }

    }

    public function show($id)
    {
        $ticket = Ticket::with(['user', 'assignedUser', 'comments.user','category', 'subCategory', 'assignedUser.role'])->find($id);

        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
            'comments' => $ticket->comments,
        ]);
    }

    public function create()
    {
        $categories = Category::with('children:id,name,parent_id')
            ->whereNull('parent_id') // Only top-level (parent) categories
            ->select('id', 'name')
            ->get();
        return Inertia::render('Tickets/Create', [
            'categories' => $categories,
        ]);
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




        if ($authUser->role_id == 4) {

            $userId = $authUser->id;


            foreach (['name', 'email', 'phone'] as $field) {
                if (empty($authUser->$field) && $request->filled($field)) {
                    $authUser->$field = $request->input($field);
                }
            }

            if ($authUser->isDirty()) {
                $authUser->save();
            }
        } else {

            $user = \App\Models\User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'password' => bcrypt(Str::random(10)),
                    'role_id' => 4,
                ]
            );

            $userId = $user->id;

                $sender     = 'UKITDA';
                $username   = config('app.hmimedia_sms_api_username');
                $password   = config('app.hmimedia_sms_api_password');
                $eid        = config('app.hmimedia_sms_api_entity_id');
                $templateId = '1307175429746978514';


                $message = "UKUCC-Welcome {$user->phone}! Your account has been created successfully.";
                $encodedMessage = rawurlencode($message);


                $apiUrl = "https://itda.hmimedia.in/pushsms.php?" .
                    http_build_query([
                        'username'     => $username,
                        'api_password' => $password,
                        'sender'       => $sender,
                        'to'           => $user->phone,
                        'priority'     => '11',
                        'e_id'         => $eid,
                        't_id'         => $templateId,
                    ]) .
                    "&message={$encodedMessage}";

                try {
                    $response = Http::withoutVerifying()->get($apiUrl);
                    $result = $response->body(); // You may log or check $result
                } catch (\Exception $e) {
                    // Log error instead of returning a response (this is a FormRequest class)
                    \Log::error('Failed to send welcome SMS: ' . $e->getMessage());
                }
        }

        // Create the ticket
        $ticket = \App\Models\Ticket::create([
            'user_id' => $userId,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'category_id' => $validated['category'],
            'sub_category_id' => $validated['sub_category'] ?? null,
            'assigned_to' => '7',
            'source' => 'web',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'open',
            'due_date' => now()->addDays(3),
            'created_by' => $authUser->id,
        ]);


                $sender     = 'UKITDA';
                $username   = config('app.hmimedia_sms_api_username');
                $password   = config('app.hmimedia_sms_api_password');
                $eid        = config('app.hmimedia_sms_api_entity_id');
                $templateId = '1307175429633438028';

                // Create a welcome message for the new user
                $message = "UKUCC-Your ticket {$ticket->ticket_number} has been created. Our team will contact you shortly.";
                $encodedMessage = rawurlencode($message);

                // Prepare SMS API config values
                $apiUrl = "https://itda.hmimedia.in/pushsms.php?" .
                    http_build_query([
                        'username'     => $username,
                        'api_password' => $password,
                        'sender'       => $sender,
                        'to'           => $authUser->phone,
                        'priority'     => '11',
                        'e_id'         => $eid,
                        't_id'         => $templateId,
                    ]) .
                    "&message={$encodedMessage}";

                try {
                    $response = Http::withoutVerifying()->get($apiUrl);
                    $result = $response->body(); // You may log or check $result
                } catch (\Exception $e) {
                    // Log error instead of returning a response (this is a FormRequest class)
                    \Log::error('Failed to send welcome SMS: ' . $e->getMessage());
                }

        return redirect()->route('home')->with('success', 'Ticket created successfully.');
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

    public function adminIndex()
    {
       $tickets = Ticket::with(['user', 'assignedUser'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
        ]);
    }

    public function adminShow($id)
    {
        $ticket = Ticket::with(['user', 'assignedUser', 'comments.user','category', 'subCategory', 'assignedUser.role'])->find($id);

        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $users = User::whereNotIn('role_id', [1, 4])->get();

        return Inertia::render('Admin/Tickets/AdminTicketShow', [
            'ticket' => $ticket,
            'comments' => $ticket->comments,
            'users' => $users,
        ]);


    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $ticket->status = $request->status;
        $ticket->assigned_to = $request->assigned_user_id;
        if($ticket->status === 'closed') {
            $ticket->closed_at = now();
        } elseif ($ticket->status === 'resolved') {
            $ticket->resolved_at = now();
        } else {
            $ticket->resolved_at = null;
            $ticket->closed_at = null;
        }
        $ticket->save();

        return back()->with('success', 'Ticket updated successfully.');
    }
}
