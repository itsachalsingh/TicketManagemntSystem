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
use App\Models\TicketComment;



class TicketCommentController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
            'message' => 'required|string|max:5000',
        ]);

        TicketComment::create([
            'ticket_id' => $request->ticket_id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);


        $ticket = Ticket::find($request->ticket_id);
        if (auth()->user()->role_id == 4 && $ticket->status == 'closed') {
            $ticket->status = 'reopened';
            $ticket->save();
        }

        return back()->with('success', 'Comment added');
    }

}
