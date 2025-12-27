<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add new profile fields
            $table->string('phone')->nullable()->after('email');
            $table->string('location')->nullable()->after('phone');
            $table->string('website')->nullable()->after('location');
            $table->date('birthday')->nullable()->after('website');
            $table->text('bio')->nullable()->change(); // Make sure bio exists and is nullable
            
            // Add deactivation fields
            $table->boolean('is_active')->default(true)->after('remember_token');
            $table->timestamp('deactivated_at')->nullable()->after('is_active');
            $table->text('deactivation_reason')->nullable()->after('deactivated_at');
            
            // Add last login timestamp
            $table->timestamp('last_login')->nullable()->after('email_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove the added fields
            $table->dropColumn([
                'phone',
                'location',
                'website',
                'birthday',
                'is_active',
                'deactivated_at',
                'deactivation_reason',
                'last_login'
            ]);
        });
    }
};