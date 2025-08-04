<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use App\Models\Otp;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function sendOtp(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'mobile' => 'required|digits:10',
        ]);

        if ($validated->fails()) {
            return response()->json(['errors' => $validated->errors()], 422);
        }

        $mobile = $request->mobile;
        $otp = rand(100000, 999999); // 6-digit OTP

        // Store OTP in DB (create or update)
        Otp::updateOrCreate(
            ['mobile' => $mobile],
            [
                'otp' => $otp,
                'expires_at' => now()->addMinutes(5)
            ]
        );

        // Prepare SMS API config values
        $sender     = 'UKITDA';
        $username   = config('app.hmimedia_sms_api_username');
        $password   = config('app.hmimedia_sms_api_password');
        $eid        = config('app.hmimedia_sms_api_entity_id');
        $templateId = '1307175429742401534';
        $message = "UKUCC-Your login OTP is $otp. Do not share it with anyone. Valid for 10 minutes.";
        $encodedMessage = rawurlencode($message); // ✅ single encoding with %20, %28, %29

        $apiUrl = "https://itda.hmimedia.in/pushsms.php?" .
            http_build_query([
                'username'     => $username,
                'api_password' => $password,
                'sender'       => $sender,
                'to'           => $mobile,
                'priority'     => '11',
                'e_id'         => $eid,
                't_id'         => $templateId,
            ]) .
            "&message={$encodedMessage}";



        try {
            $response = Http::withoutVerifying()->get($apiUrl); // Skip SSL verification if needed
            $result = $response->body();

            return response()->json([
                'message'      => 'OTP sent successfully',
                'otp'          => config('app.env') !== 'production' ? $otp : null,
                'sms_response' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send OTP',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
