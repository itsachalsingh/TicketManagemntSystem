<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

Route::get('/', function () {

    if (auth()->check()) {

        $user = auth()->user();


        if ($user->role_id == '4') {
            return redirect()->route('dashboard');
        } elseif ($user->role_id == '3') {
            return redirect()->route('dashboard');
        } else {
            return redirect()->route('admin.dashboard');
        }
    } else {
        return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
    }

})->name('home');


Route::get('/dashboard', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->role_id == '4' || $user->role_id == '3') {
            return redirect()->route('dashboard');
        } else {
            return redirect()->route('admin.dashboard');
        }
    } else {
        return redirect()->route('home');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'not.admin'])->group(function () {
    Route::get('/dashboard', [TicketController::class, 'index'])->name('dashboard');
    Route::get('/ticket/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/ticket', [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/ticket/{ticket}/edit', [TicketController::class, 'edit'])->name('tickets.edit');
    Route::put('/ticket/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
    Route::delete('/ticket/{ticket}', [TicketController::class, 'destroy'])->name('tickets.destroy');
    Route::get('/ticket/{ticket}', [TicketController::class, 'show'])->name('tickets.show');


});

Route::get('login', function () {
    return redirect()->route('home');
})->name('login');


Route::middleware(['auth', 'verified', 'only.admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::resource('categories', CategoryController::class);
    Route::resource('users', UserController::class);
    Route::get('/tickets', [TicketController::class, 'adminIndex'])->name('admin.tickets.index');
    Route::get('/tickets/{ticket}', [TicketController::class, 'adminShow'])->name('admin.tickets.show');
    Route::patch('/admin/tickets/{ticket}/update-status', [TicketController::class, 'updateStatus'])->name('admin.tickets.update-status');


});


Route::post('/comments', [TicketCommentController::class, 'store'])->name('comments.store');

require __DIR__.'/auth.php';

Route::fallback(function () {
    return Inertia::render('Errors/NotFound');
});
