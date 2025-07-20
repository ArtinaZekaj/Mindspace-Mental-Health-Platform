<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        $messages = [
            'email.required' => 'Email is required.',
            'email.email' => 'Email must be a valid email address like example@example.com.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[A-Z]/',    // At least one uppercase letter
                'regex:/[a-z]/',    // At least one lowercase letter
                'regex:/[0-9]/',    // At least one digit
                'regex:/[@$!%*#?&]/', // At least one special character
            ],
        ], $messages);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Përdoruesi u regjistrua me sukses.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ],
            'token' => $token
        ]);
    }


    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email ose fjalëkalimi janë të pasaktë.',
            ], 401);
        }

        $user = User::where('email', $request->email)->first();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login me sukses.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6|confirmed'
        ]);

        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'Profili u përditësua me sukses.']);
    }


    public function destroyAccount()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->delete();

        return response()->json(['message' => 'Llogaria u fshi me sukses.']);
    }
}
