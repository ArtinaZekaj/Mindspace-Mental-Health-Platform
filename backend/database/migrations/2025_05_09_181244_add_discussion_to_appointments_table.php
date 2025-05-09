<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('appointments', function (Blueprint $table) {
        $table->text('discussion')->nullable()->after('status'); // shton kolonën
    });
}

public function down(): void
{
    Schema::table('appointments', function (Blueprint $table) {
        $table->dropColumn('discussion'); // fshin kolonën nëse bëhet rollback
    });
}

};
