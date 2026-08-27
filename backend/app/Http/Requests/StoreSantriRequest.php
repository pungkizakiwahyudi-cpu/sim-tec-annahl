<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Santri;

class StoreSantriRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // Ambil user_id jika sedang dalam mode UPDATE
        $santriId = $this->route('id');
        $userId   = $santriId ? Santri::find($santriId)?->user_id : null;

        return [
            'name'            => 'required|string|max:255',
            'email'           => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            // Password wajib saat buat baru (POST), opsional saat update (PUT/PATCH)
            'password'        => $this->isMethod('POST') ? 'required|string|min:6' : 'nullable|string|min:6',
            'nis'             => [
                'required',
                'string',
                Rule::unique('santris', 'nis')->ignore($santriId),
            ],
            'jenis_kelamin'   => 'required|in:L,P,Laki-laki,Perempuan',
            'kategori'        => 'nullable|in:akhi,akhwat,anak_anak',
            'tempat_lahir'    => 'nullable|string|max:100',
            'tanggal_lahir'   => 'nullable|date',
            'alamat'          => 'nullable|string',
            'nama_orang_tua'  => 'nullable|string|max:255',
            'no_hp_orang_tua' => 'nullable|string|max:20',
            'kelas_id'        => 'nullable|exists:kelas,id',
            // Menambahkan semua variasi string "Pendaftar Baru" agar diterima oleh backend
            'status'          => [
                'nullable',
                'string',
                'in:aktif,nonaktif,alumni,pending,ditolak,pendaftar_baru,Pendaftar Baru,pendaftar baru,pendaftar_baru,diterima'
            ],
        ];
    }

    /**
     * Custom message validation
     */
    public function messages(): array
    {
        return [
            'name.required'     => 'Nama wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.unique'      => 'Email sudah digunakan oleh pengguna lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
            'nis.required'      => 'NIS wajib diisi.',
            'nis.unique'        => 'NIS sudah terdaftar.',
            'kelas_id.exists'   => 'Kelas yang dipilih tidak valid.',
            'status.in'         => 'Status yang dipilih tidak valid.',
        ];
    }
}
