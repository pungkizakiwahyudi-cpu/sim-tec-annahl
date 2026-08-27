<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Santri;
use App\Models\Ustadz;
use App\Models\Kelas;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);
    }

    private function getToken(User $user): string
    {
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        return $response->json('data.token');
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = $this->createAdmin();
        $token = $this->getToken($admin);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_santri_aktif',
                    'total_ustadz',
                    'total_kelas',
                ],
            ]);
    }

    public function test_admin_can_create_santri(): void
    {
        $admin = $this->createAdmin();
        $token = $this->getToken($admin);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/admin/santri', [
                'name' => 'Test Santri',
                'email' => 'santri@test.com',
                'password' => 'password123',
                'nis' => 'NIS001',
                'jenis_kelamin' => 'Laki-laki',
                'kategori' => 'akhi',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $santri = User::factory()->create([
            'email' => 'santri@test.com',
            'password' => bcrypt('password123'),
            'role' => 'santri',
        ]);
        $token = $this->getToken($santri);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_can_get_settings(): void
    {
        $admin = $this->createAdmin();
        $token = $this->getToken($admin);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/settings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['nama_sistem', 'tahun_ajaran'],
            ]);
    }
}