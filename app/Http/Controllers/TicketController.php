<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use FFMpeg\Format\Video\X264;

class TicketController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role_id == 4) {
            $tickets = Ticket::with(['user'])
                ->where('user_id', $user->id)
                ->latest()
                ->get();

            return Inertia::render('Dashboard', [
                'tickets' => $tickets,
                'user'    => $user,
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
                'user'    => $user,
            ]);
        } else {
            $tickets = Ticket::with(['user', 'assignedUser'])
                ->latest()
                ->get();

            return Inertia::render('Dashboard', [
                'tickets' => $tickets,
                'user'    => $user,
            ]);
        }
    }

    public function show($id)
    {
        $ticket = Ticket::with([
            'user',
            'assignedUser',
            'comments.user',
            'category',
            'subCategory',
            'assignedUser.role',
            'attachments',
        ])->find($id);

        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        return Inertia::render('Tickets/Show', [
            'ticket'   => $ticket,
            'comments' => $ticket->comments,
        ]);
    }

    public function create()
    {
        $categories = Category::with('children:id,name,parent_id')
            ->whereNull('parent_id')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Tickets/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        $validated = Validator::make($request->all(), [
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|max:150',
            'phone'        => 'required|string|max:20',
            'subject'      => 'required|string|max:255',
            'description'  => 'required|string',
            'priority'     => 'required|string|in:low,medium,high',
            'category'     => 'required|string|max:100',
            'sub_category' => 'nullable|string|max:100',


            'attachments'   => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,webp,heic,heif,mp4,mov,m4v,avi,webm|max:51200',
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
            $user = User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name'     => $validated['name'],
                    'phone'    => $validated['phone'],
                    'password' => bcrypt(Str::random(10)),
                    'role_id'  => 4,
                ]
            );

            $userId = $user->id;


            try {
                $sender     = 'UKITDA';
                $username   = config('app.hmimedia_sms_api_username');
                $password   = config('app.hmimedia_sms_api_password');
                $eid        = config('app.hmimedia_sms_api_entity_id');
                $templateId = '1307175429746978514';

                $message        = "UKUCC-Welcome {$user->phone}! Your account has been created successfully.";
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

                Http::withoutVerifying()->get($apiUrl);
            } catch (\Exception $e) {
                Log::error('Failed to send welcome SMS: ' . $e->getMessage());
            }
        }


        $ticket = Ticket::create([
            'user_id'         => $userId,
            'subject'         => $validated['subject'],
            'description'     => $validated['description'],
            'priority'        => $validated['priority'],
            'category_id'     => $validated['category'],
            'sub_category_id' => $validated['sub_category'] ?? null,
            'assigned_to'     => '7',
            'source'          => 'web',
            'ip_address'      => $request->ip(),
            'user_agent'      => $request->userAgent(),
            'status'          => 'open',
            'due_date'        => now()->addDays(3),
            'created_by'      => $authUser->id,
        ]);


        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $upload) {
                if (!$upload->isValid()) {
                    Log::warning('Skipping invalid uploaded file.');
                    continue;
                }

                $mime   = $upload->getMimeType() ?: '';
                $orig   = $upload->getClientOriginalName();
                $isVideo = str_starts_with($mime, 'video');

                if (!$isVideo) {

                    try {
                        $processed = $this->compressImageToWebp($upload, 1920, 75);
                        if ($processed) {
                            [$blob, $outMime, $ext] = $processed;
                            $filename = pathinfo($orig, PATHINFO_FILENAME);
                            $relative = "tickets/{$ticket->id}/images/" . Str::slug($filename) . "-" . Str::random(8) . ".{$ext}";
                            $fullPath = public_path($relative);

                            if (!is_dir(dirname($fullPath))) {
                                @mkdir(dirname($fullPath), 0775, true);
                            }

                            file_put_contents($fullPath, $blob);

                            Ticket_attachment::create([
                                'ticket_id'     => $ticket->id,
                                'user_id'       => $userId,
                                'path'          => $relative,
                                'original_name' => $orig,
                                'mime_type'     => $outMime,
                                'size'          => @filesize($fullPath) ?: null,
                                'kind'          => 'image',
                            ]);
                        } else {

                            $ext    = $upload->getClientOriginalExtension() ?: 'bin';
                            $fname  = pathinfo($orig, PATHINFO_FILENAME);
                            $relative = "tickets/{$ticket->id}/images/" . Str::slug($fname) . "-" . Str::random(8) . "." . strtolower($ext);
                            $fullPath = public_path($relative);

                            if (!is_dir(dirname($fullPath))) {
                                @mkdir(dirname($fullPath), 0775, true);
                            }


                            $upload->move(dirname($fullPath), basename($fullPath));

                            TicketAttachment::create([
                                'ticket_id'     => $ticket->id,
                                'user_id'       => $userId,
                                'path'          => $relative,
                                'original_name' => $orig,
                                'mime_type'     => $mime,
                                'size'          => @filesize($fullPath) ?: null,
                                'kind'          => 'image',
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error('Image processing failed: ' . $e->getMessage());
                    }
                } else {

                    $tmpInputPath = $upload->store('tmp', 'local');
                    $tmpInputAbs  = storage_path('app/' . $tmpInputPath);
                    $tmpOutputAbs = storage_path('app/tmp/' . Str::uuid() . '.mp4');

                    if (!is_dir(dirname($tmpOutputAbs))) {
                        @mkdir(dirname($tmpOutputAbs), 0775, true);
                    }

                    $transcodedOk = false;

                    try {
                        FFMpeg::fromDisk('local')
                            ->open($tmpInputPath)
                            ->export()
                            ->toDisk('local')
                            ->inFormat(new X264('aac', 'libx264'))
                            ->resize(1280, 720)
                            ->addFilter('-preset', 'veryfast')
                            ->addFilter('-crf', '26')
                            ->addFilter('-movflags', '+faststart')
                            ->save($tmpOutputAbs);

                        $filename = pathinfo($orig, PATHINFO_FILENAME);
                        $relative = "tickets/{$ticket->id}/videos/" . Str::slug($filename) . "-" . Str::random(8) . ".mp4";
                        $fullPath = public_path($relative);

                        if (!is_dir(dirname($fullPath))) {
                            @mkdir(dirname($fullPath), 0775, true);
                        }

                        // write transcoded file to public
                        @copy($tmpOutputAbs, $fullPath);

                        Ticket_attachment::create([
                            'ticket_id'     => $ticket->id,
                            'user_id'       => $userId,
                            'path'          => $relative,
                            'original_name' => $orig,
                            'mime_type'     => 'video/mp4',
                            'size'          => @filesize($fullPath) ?: null,
                            'kind'          => 'video',
                        ]);

                        $transcodedOk = true;
                    } catch (\Exception $e) {
                        Log::error('Video transcode failed: ' . $e->getMessage());
                    } finally {
                        if (is_file($tmpOutputAbs)) {
                            @unlink($tmpOutputAbs);
                        }
                        if (is_file($tmpInputAbs)) {
                            @unlink($tmpInputAbs);
                        }
                    }

                    if (!$transcodedOk) {
                        // Fallback: move original video as-is
                        try {
                            $ext    = $upload->getClientOriginalExtension() ?: 'bin';
                            $fname  = pathinfo($orig, PATHINFO_FILENAME);
                            $relative = "tickets/{$ticket->id}/videos/" . Str::slug($fname) . "-" . Str::random(8) . "." . strtolower($ext);
                            $fullPath = public_path($relative);

                            if (!is_dir(dirname($fullPath))) {
                                @mkdir(dirname($fullPath), 0775, true);
                            }

                            $upload->move(dirname($fullPath), basename($fullPath));

                            Ticket_attachment::create([
                                'ticket_id'     => $ticket->id,
                                'user_id'       => $userId,
                                'path'          => $relative,
                                'original_name' => $orig,
                                'mime_type'     => $mime,
                                'size'          => @filesize($fullPath) ?: null,
                                'kind'          => 'video',
                            ]);
                        } catch (\Exception $ex) {
                            Log::error('Fallback video store failed: ' . $ex->getMessage());
                        }
                    }
                }
            }
        }

        // Ticket created SMS (to requester)
        try {
            $sender     = 'UKITDA';
            $username   = config('app.hmimedia_sms_api_username');
            $password   = config('app.hmimedia_sms_api_password');
            $eid        = config('app.hmimedia_sms_api_entity_id');
            $templateId = '1307175429633438028';

            $message        = "UKUCC-Your ticket {$ticket->ticket_number} has been created. Our team will contact you shortly.";
            $encodedMessage = rawurlencode($message);
            $toPhone        = $authUser->phone ?: ($request->input('phone') ?? '');

            if ($toPhone) {
                $apiUrl = "https://itda.hmimedia.in/pushsms.php?" .
                    http_build_query([
                        'username'     => $username,
                        'api_password' => $password,
                        'sender'       => $sender,
                        'to'           => $toPhone,
                        'priority'     => '11',
                        'e_id'         => $eid,
                        't_id'         => $templateId,
                    ]) .
                    "&message={$encodedMessage}";

                Http::withoutVerifying()->get($apiUrl);
            } else {
                Log::warning('Ticket SMS skipped: no phone available.');
            }
        } catch (\Exception $e) {
            Log::error('Failed to send ticket SMS: ' . $e->getMessage());
        }

        return redirect()->route('home')->with('success', 'Ticket created successfully.');
    }

    public function edit($id)
    {
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
        $ticket = Ticket::with(['user', 'assignedUser'])->find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $validated = Validator::make($request->all(), [
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'assigned_user_id' => 'nullable|exists:users,id',
        ])->validate();

        $ticket->update([
            'subject'     => $validated['title'],
            'description' => $validated['description'],
            'assigned_to' => $validated['assigned_user_id'] ?? $ticket->assigned_to,
        ]);

        return redirect()->route('tickets.show', $ticket->id);
    }

    public function destroy($id)
    {
        $ticket = Ticket::with(['user', 'assignedUser'])->find($id);
        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $ticket->delete();

        return redirect()->route('tickets.index');
    }

    public function assign(Request $request, $id)
    {
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
        $ticket = Ticket::with([
            'user',
            'assignedUser',
            'comments.user',
            'category',
            'subCategory',
            'assignedUser.role',
            'attachments',
        ])->find($id);

        if (!$ticket) {
            throw new ModelNotFoundException('Ticket not found');
        }

        $users = User::whereNotIn('role_id', [1, 4])->get();

        return Inertia::render('Admin/Tickets/AdminTicketShow', [
            'ticket'   => $ticket,
            'comments' => $ticket->comments,
            'users'    => $users,
        ]);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = Validator::make($request->all(), [
            'status'           => ['required', Rule::in(['open', 'in_progress', 'resolved', 'closed', 'reopened'])],
            'assigned_user_id' => 'nullable|exists:users,id',
        ])->validate();

        $ticket->status = $validated['status'];
        $ticket->assigned_to = $validated['assigned_user_id'] ?? $ticket->assigned_to;

        if ($ticket->status === 'closed') {
            $ticket->closed_at = now();
        } elseif ($ticket->status === 'resolved') {
            $ticket->resolved_at = now();
            $ticket->closed_at   = null;
        } else {
            $ticket->resolved_at = null;
            $ticket->closed_at   = null;
        }

        $ticket->save();

        return back()->with('success', 'Ticket updated successfully.');
    }

    /**
     * Compress an uploaded image to WEBP (or PNG/JPEG fallback) using Imagick or GD.
     * Returns [binaryBlob, mime, extension] on success, or null on failure.
     */
    private function compressImageToWebp(\Illuminate\Http\UploadedFile $upload, int $maxDim = 1920, int $quality = 75): ?array
    {
        $path = $upload->getRealPath();
        if (!$path) return null;

        $data = @file_get_contents($path);
        if ($data === false) return null;

        // Try Imagick first (best quality + HEIC support if codecs are present)
        if (class_exists(\Imagick::class)) {
            try {
                $im = new \Imagick();
                $im->readImageBlob($data);

                // Resize to fit within maxDim x maxDim
                $geo = $im->getImageGeometry();
                $w = $geo['width'] ?? 0;
                $h = $geo['height'] ?? 0;
                if ($w > 0 && $h > 0 && ($w > $maxDim || $h > $maxDim)) {
                    $im->resizeImage($maxDim, $maxDim, \Imagick::FILTER_LANCZOS, 1, true);
                }

                // Encode to WEBP
                $im->setImageFormat('webp');
                if (method_exists($im, 'setImageCompressionQuality')) {
                    $im->setImageCompressionQuality($quality);
                }
                $blob = $im->getImageBlob();
                $im->clear();

                return [$blob, 'image/webp', 'webp'];
            } catch (\Throwable $e) {
                Log::warning('Imagick failed, will try GD: ' . $e->getMessage());
            }
        }

        // GD fallback
        if (function_exists('imagecreatefromstring')) {
            try {
                $src = @imagecreatefromstring($data);
                if ($src === false) return null;

                $w = imagesx($src);
                $h = imagesy($src);

                // compute new size
                $scale = 1.0;
                if ($w > $maxDim || $h > $maxDim) {
                    $scale = min($maxDim / $w, $maxDim / $h);
                }
                $nw = (int) floor($w * $scale);
                $nh = (int) floor($h * $scale);

                $dst = imagecreatetruecolor($nw, $nh);
                // preserve transparency for PNGs
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

                // Prefer WEBP if available
                if (function_exists('imagewebp')) {
                    ob_start();
                    imagewebp($dst, null, $quality);
                    $blob = ob_get_clean();
                    imagedestroy($dst);
                    imagedestroy($src);
                    if ($blob !== false) {
                        return [$blob, 'image/webp', 'webp'];
                    }
                }

                // Fallback to PNG
                if (function_exists('imagepng')) {
                    ob_start();
                    imagepng($dst);
                    $blob = ob_get_clean();
                    imagedestroy($dst);
                    imagedestroy($src);
                    if ($blob !== false) {
                        return [$blob, 'image/png', 'png'];
                    }
                }

                // Last resort: JPEG
                if (function_exists('imagejpeg')) {
                    ob_start();
                    imagejpeg($dst, null, 85);
                    $blob = ob_get_clean();
                    imagedestroy($dst);
                    imagedestroy($src);
                    if ($blob !== false) {
                        return [$blob, 'image/jpeg', 'jpg'];
                    }
                }

                imagedestroy($dst);
                imagedestroy($src);
            } catch (\Throwable $e) {
                Log::warning('GD image processing failed: ' . $e->getMessage());
            }
        }

        return null; // store original
    }
}
