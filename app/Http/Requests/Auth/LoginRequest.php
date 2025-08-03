<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules: Require email+password or phone+otp
     */
    public function rules(): array
    {
        return [
            'email' => ['nullable', 'string', 'email', 'required_without:phone'],
            'password' => ['nullable', 'string', 'required_with:email'],
            'phone' => ['nullable', 'string', 'required_without:email'],
            'otp' => ['nullable', 'string', 'required_with:phone'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();


        if ($this->filled('email') && $this->filled('password')) {
            if (!Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => trans('auth.failed'),
                ]);
            }
        }


        elseif ($this->filled('phone') && $this->filled('otp')) {
            $phone = $this->input('phone');
            $otpInput = $this->input('otp');

            // Fetch latest OTP for the mobile
            $otpRecord = DB::table('otps')
                ->where('mobile', $phone)
                ->orderByDesc('created_at')
                ->first();

            if (!$otpRecord || $otpRecord->otp !== $otpInput || now()->greaterThan($otpRecord->expires_at)) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'otp' => trans('auth.failed'), // You can customize this message
                ]);
            }

            // Check if user already exists
            $user = User::where('phone', $phone)->first();

            if (!$user) {
                // Auto-register new user
                $user = User::create([
                    'phone' => $phone,
                    'name' => 'User ' . $phone,
                    'password' => Hash::make(Str::random(10)),
                    'role_id' => 4,
                    'email' => null,
                ]);
            }

            Auth::login($user, $this->boolean('remember'));
        }

        // === Invalid fallback ===
        else {
            throw ValidationException::withMessages([
                'login' => 'Invalid login credentials.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     */
    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $identifier = $this->filled('email') ? $this->string('email') : $this->string('phone');
        return Str::transliterate(Str::lower($identifier) . '|' . $this->ip());
    }
}
