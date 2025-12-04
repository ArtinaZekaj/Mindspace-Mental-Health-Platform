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
        Schema::create('ligjeruesi', function (Blueprint $table) {
            $table->id('LigjeruesiID');
            $table->string('Emri');
            $table->string('Mbiemri');
            $table->string('Specializmi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ligjeruesi');
    }
};
