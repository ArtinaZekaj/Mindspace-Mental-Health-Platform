<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (Auth::check() && in_array(Auth::user()->role, ['admin', 'psychologist'])) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Access denied. Admins and psychologists only.'
        ], 403);
    }
}
