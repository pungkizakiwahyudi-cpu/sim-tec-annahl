<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Ustadz;

class StoreUstadzRequest extends FormRequest
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
        $ustadzId = $this->route('id');
        $userId   = $ustadzId ? Ustadz::find($ustadzId)?->user_id : null;

        return [
            'name'          => 'required|string|max:255',
            'email'         => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            // Password wajib saat buat baru (POST), opsional saat update (PUT/PATCH)
            'password'      => $this->isMethod('POST') ? 'required|string|min:6' : 'nullable|string|min:6',
            'nip'           => [
                'required',
                'string',
                Rule::unique('ustadzs', 'nip')->ignore($ustadzId),
            ],
            'jenis_kelamin' => 'required|in:L,P,Laki-laki,Perempuan',
            'bidang_ajar'   => 'nullable|string|max:100',
            'no_hp'         => 'nullable|string|max:20',
            'alamat'        => 'nullable|string',
            'spesialisasi'  => 'nullable|string|max:100',
            'status'        => 'nullable|in:aktif,nonaktif',
        ];
    }

    /**
     * Custom message validation (Opsional)
     */
    public function messages(): array
    {
        return [
            'name.required'     => 'Nama ustadz wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.unique'      => 'Email sudah digunakan oleh pengguna lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
            'nip.required'      => 'NIP/NIPY wajib diisi.',
            'nip.unique'         => 'NIP/NIPY sudah terdaftar.',
        ];
    }
}