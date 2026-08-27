<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_success(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['user', 'token', 'expires_at'],
            ]);
    }

    public function test_login_failed(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_login_rate_limited(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/login', [
                'email' => 'test@test.com',
                'password' => 'wrong',
            ]);
        }

        $response = $this->postJson('/api/login', [
            'email' => 'test@test.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(429);
    }
}