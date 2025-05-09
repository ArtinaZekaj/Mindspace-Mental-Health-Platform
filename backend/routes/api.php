<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\ReflectionController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CalendarController;
use Illuminate\Support\Facades\Auth;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//ROUTE PER SANCTUM middleware kontrollon në çdo kërkesë nëse ky token ekziston, eshte i vlefshem...
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', function (Request $request) {
        return response()->json([
            'message' => 'Ky është profili i mbrojtur.',
            'user' => $request->user()
        ]);
    });

    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::delete('/profile/delete', [AuthController::class, 'destroyAccount']);
    
    // ✅ Route për dropdown e psikologëve në frontend
    Route::get('/psychologists', function () {
        return \App\Models\User::where('role', 'psychologist')->get(['id', 'name']);
    });
});

//Routes per kontrollerin Reflection
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reflections', [ReflectionController::class, 'index']);
    Route::post('/reflections', [ReflectionController::class, 'store']);
    Route::put('/reflections/{id}', [ReflectionController::class, 'update']);
    Route::delete('/reflections/{id}', [ReflectionController::class, 'destroy']);
    Route::get('/reflections/summary', [ReflectionController::class, 'summary']);
    Route::get('/reflections/summary/user/{id}', [ReflectionController::class, 'summaryForUser']);
    Route::get('/admin/stats', [ReflectionController::class, 'adminStats']);
});

Route::middleware('auth:sanctum')->get('/me', function () {
    $user = Auth::user();

    return response()->json([
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'is_admin' => $user->role === 'admin',
        'is_psychologist' => $user->role === 'psychologist',
        'message' => match ($user->role) {
            'admin' => 'Welcome, Admin! You have full access.',
            'psychologist' => 'Hello Psychologist! Ready to check student moods?',
            default => 'Welcome back!',
        }
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/my', [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/schedule', [AppointmentController::class, 'psychologistSchedule']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'availableSlots']);

});

Route::middleware('auth:sanctum')->get('/calendar/month', [CalendarController::class, 'monthOverview']);
