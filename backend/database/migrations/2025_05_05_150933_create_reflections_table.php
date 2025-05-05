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
        // Schema::create('reflections', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('user_id')->constrained()->onDelete('cascade');
        //     $table->string('title')->nullable();
        //     $table->text('content');
        //     $table->string('mood'); // p.sh. calm, sad, happy...
        //     $table->date('date');
        //     $table->timestamps();
        // });
        //e bejme koment kete sepse njehere kjo tabele eshte krijuar dhe per me shtu diqka te re e shtojm vetem kolonen e re
        //sepse nese i lajm edhe kto athere na shfaqet errori se kto kolona ekzistojne ... e bejme si me posht:

        Schema::table('reflections', function (Blueprint $table) {
            $table->date('date')->after('mood'); // ✅ vetëm kjo kolonë e re
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reflections');
    }
};
