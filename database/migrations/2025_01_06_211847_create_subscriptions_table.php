<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubscriptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id(); // Auto-increment ID
            $table->string('plan_name'); // Subscription plan name
            $table->decimal('price', 8, 2); // Price of the subscription
            $table->text('features'); // Features of the subscription (JSON or text)
            $table->integer('max_devices'); // Maximum number of devices
            $table->string('video_quality'); // Video quality (e.g., HD, 4K)
            $table->boolean('has_ads')->default(false); // Indicates if the plan includes ads
            $table->enum('status', ['active', 'inactive'])->default('active'); // Subscription status
            $table->timestamps(); // Created at and updated at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('subscriptions');
    }
}
