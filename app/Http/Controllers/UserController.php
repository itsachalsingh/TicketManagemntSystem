<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role')
            ->where('role_id', '!=', 1)
            ->where('role_id', '!=', 4)
            ->latest()
            ->get();

        $roles = Role::whereNotIn('id', [1, 4])->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'totalUsers' => $users->count(),
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:15|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|exists:roles,id',
        ], [
            'email.unique' => 'This email is already taken.',
            'phone.unique' => 'This phone number is already in use.',
            'password.confirmed' => 'Passwords do not match.',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => bcrypt($validated['password']),
            'role_id' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->role_id == 1 || $user->role_id == 4) {
            return redirect()->back()->with('error', 'You cannot delete this user.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:15|unique:users,phone,' . $user->id,
            'role' => 'required|exists:roles,id',
        ], [
            'email.unique' => 'This email is already taken.',
            'phone.unique' => 'This phone number is already in use.',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role_id' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }
}
