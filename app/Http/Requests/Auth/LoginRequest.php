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
use Illuminate\Support\Facades\Http;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['nullable', 'string', 'email', 'required_without:phone'],
            'password' => ['nullable', 'string', 'required_with:email'],
            'phone'    => ['nullable', 'string', 'required_without:email'],
            'otp'      => ['nullable', 'string', 'required_with:phone'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

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

            RateLimiter::clear($this->throttleKey());
            return;
        }

        if ($this->filled('phone') && $this->filled('otp')) {
            $phone    = $this->input('phone');
            $otpInput = $this->input('otp');

            $otpRecord = DB::table('otps')
                ->where('mobile', $phone)
                ->orderByDesc('created_at')
                ->first();

            if (!$otpRecord || $otpRecord->otp !== $otpInput || now()->greaterThan($otpRecord->expires_at)) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'otp' => trans('auth.failed'),
                ]);
            }

            $user = User::where('phone', $phone)->first();

            if (!$user) {
                $user = User::create([
                    'phone'    => $phone,
                    'name'     => 'User ' . $phone,
                    'password' => Hash::make(Str::random(10)),
                    'role_id'  => 4,
                    'email'    => null,
                ]);

                $sender     = 'UKITDA';
                $username   = config('app.hmimedia_sms_api_username');
                $password   = config('app.hmimedia_sms_api_password');
                $eid        = config('app.hmimedia_sms_api_entity_id');
                $templateId = '1307175429746978514';

                // Create a welcome message for the new user
                $message = "UKUCC-Welcome {$user->phone}! Your account has been created successfully.";
                $encodedMessage = rawurlencode($message);

                // Prepare SMS API config values
                $apiUrl = "https://itda.hmimedia.in/pushsms.php?" .
                    http_build_query([
                        'username'     => $username,
                        'api_password' => $password,
                        'sender'       => $sender,
                        'to'           => $phone,
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

            Auth::login($user, $this->boolean('remember'));

            RateLimiter::clear($this->throttleKey());
            return;
        }

        // Fallback: no valid input combination
        throw ValidationException::withMessages([
            'login' => 'Invalid login credentials.',
        ]);
    }

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

    public function throttleKey(): string
    {
        $identifier = $this->filled('email') ? $this->string('email') : $this->string('phone');
        return Str::transliterate(Str::lower($identifier) . '|' . $this->ip());
    }
}
