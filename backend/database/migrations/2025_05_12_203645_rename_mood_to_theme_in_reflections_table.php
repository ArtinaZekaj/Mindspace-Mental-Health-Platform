<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('reflections', function (Blueprint $table) {
        $table->renameColumn('mood', 'theme');
    });
}

public function down()
{
    Schema::table('reflections', function (Blueprint $table) {
        $table->renameColumn('theme', 'mood');
    });
}

};
