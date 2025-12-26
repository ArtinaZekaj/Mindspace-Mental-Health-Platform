<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\MoodController;
use App\Http\Controllers\User\ReflectionController;
use App\Http\Controllers\User\AppointmentController as UserAppointmentController;
use App\Http\Controllers\User\CalendarController;
use App\Http\Controllers\psychologist\PatientNoteController;
use App\Http\Controllers\admin\AdminController;
use App\Http\Controllers\User\AIChatController;



Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);



Route::middleware('auth:sanctum')->group(function () {

    // Profile Routes
    Route::get('/profile', fn(Request $request) => response()->json([
        'message' => 'Ky është profili i mbrojtur.',
        'user' => $request->user()
    ]));
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::delete('/profile/delete', [AuthController::class, 'destroyAccount']);

    // Get Logged-in User Info
    Route::get('/me', function () {
        $user = Auth::user();

        $message = 'Welcome back!';
        if ($user->role === 'admin') {
            $message = 'Welcome, Admin! You have full access.';
        } elseif ($user->role === 'psychologist') {
            $message = 'Hello Psychologist! Ready to check student moods?';
        }

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_admin' => $user->role === 'admin',
            'is_psychologist' => $user->role === 'psychologist',
            'message' => $message,
        ]);
    });

    //Users Routes:
    // Reflection Routes
    Route::get('/reflections', [ReflectionController::class, 'index']);
    Route::post('/reflections', [ReflectionController::class, 'store']);
    Route::put('/reflections/{id}', [ReflectionController::class, 'update']);
    Route::delete('/reflections/{id}', [ReflectionController::class, 'destroy']);
    Route::get('/reflections/summary', [ReflectionController::class, 'summary']);
    Route::get('/reflections/summary/user/{id}', [ReflectionController::class, 'summaryForUser']);


    // Mood Routes
    Route::get('/moods', [MoodController::class, 'index']);
    Route::post('/moods', [MoodController::class, 'store']);
    Route::put('/moods/{id}', [MoodController::class, 'update']);
    Route::delete('/moods/{id}', [MoodController::class, 'destroy']);


    // Appointment Routes
    Route::post('/appointments', [UserAppointmentController::class, 'store']);
    Route::get('/appointments/my', [UserAppointmentController::class, 'myAppointments']);
    Route::delete('/appointments/{id}', [UserAppointmentController::class, 'destroy']);
    Route::put('/appointments/{id}', [UserAppointmentController::class, 'update']);
    Route::get('/appointments/available-slots', [UserAppointmentController::class, 'availableSlots']);


    // Calendar
    Route::get('/calendar/month', [CalendarController::class, 'monthOverview']);


    //Psychologists Route:
    // Psychologist Dropdown
    Route::get('/psychologists', fn() => \App\Models\User::where('role', 'psychologist')->get(['id', 'name']));
    //Psychologist PatientNote(po e krijoje endpoint ne kete menyre me 'apiResource' per te gjithe CRUD-in pa pasur nevoje ti shenoje 4 endpoint me index,store,update,destroy... ):
    Route::apiResource('patient-notes', PatientNoteController::class);
    //Ky route merre te gjithe mood e pacienteve te nje psikologu te caktuar
    Route::get('/psychologist/patient-moods', [MoodController::class, 'moodsFromPatients']);
    //Ky route merre te gjitha reflektimet, por edhe vetem reflektimet e 7 diteve te fundit per psikolog/e specifik/
    Route::get('/psychologist/reflections', [ReflectionController::class, 'reflectionsFromMyPatients']);
    //Route posht do ti merre pacientat e nje psikologu te caktuar:
    Route::get('/psychologist/appointments', [UserAppointmentController::class, 'psychologistAppointments']);


    //Admin Routes:
    Route::get('/admin/dashboard-stats', [AdminController::class, 'index']);
    // Recent Appointments
    Route::get('/admin/recent-appointments', [AdminController::class, 'recentAppointments']);
    // Mood Statistics
    Route::get('/admin/mood-statistics', [AdminController::class, 'moodStatistics']);
    // Get all users with role 'user'
    Route::get('/admin/patients', [AdminController::class, 'patientList']);
    // Switch the status of a specific patient between 'active' and 'inactive'
    Route::put('/admin/patients/{id}/toggle-status', [AdminController::class, 'toggleStatus']);
    //Delete Patients:
    Route::delete('/admin/patients/{id}', [AdminController::class, 'destroy']);
    //Update Patients:
    Route::put('/admin/patients/{id}', [AdminController::class, 'update']);
    //Add Patients:
    Route::post('/admin/patients', [AdminController::class, 'store']);
    //Get Psychologist 
    Route::get('/admin/psychologists', [AdminController::class, 'psychologistList']);
    //Switch status for psychologist
    Route::put('/admin/psychologists/{id}/toggle-status', [AdminController::class, 'togglePsychologistStatus']);
    //Add Psychologist:
    Route::post('/admin/psychologists', [AdminController::class, 'storePsychologist']);
    //Update Psychologist
    Route::put('/admin/psychologists/{id}', [AdminController::class, 'updatePsychologist']);
    //Delete Psychologist
    Route::delete('/admin/psychologists/{id}', [AdminController::class, 'destroyPsychologist']);
    // Get all appointments with user and psychologist info
    Route::get('/admin/appointments', [AdminController::class, 'allAppointments']);
    //Update status, approved or canceled:
    Route::put('/admin/appointments/{id}/status', [AdminController::class, 'updateAppointmentStatus']);
    //Add Appointment:
    Route::post('/admin/appointments', [AdminController::class, 'storeAdminAppointment']);
    //Profile Admin


    //AI Emotional Suggestions Route:
    Route::post('/ai/suggestion', [MoodController::class, 'aiSuggestion']);

    //AI Chatbot Route:
    Route::post('/ai/chat', [AIChatController::class, 'chat']);
});
