<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_only_health_is_public_outside_the_versioned_api(): void
    {
        $this->get('/up')->assertOk();
        $this->getJson('/')->assertNotFound();
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->get('/live-wall')->assertOk()->assertSee('Sẵn sàng nhận ánh sáng');
        $this->getJson('/sanctum/csrf-cookie')->assertNotFound();
    }
}
