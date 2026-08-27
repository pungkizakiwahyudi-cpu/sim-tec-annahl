<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_kelas'      => ['required', 'string', 'max:255'],
            'program_belajar' => ['required', 'string', 'max:255'],
            'kategori'        => ['required', 'in:akhi,akhwat,anak_anak'],
            'deskripsi'       => ['nullable', 'string'],
            'ustadz_id'       => ['nullable', 'integer', 'exists:ustadzs,id'],
            'santri_ids'      => ['nullable', 'array'],
            'santri_ids.*'    => ['integer', 'exists:santris,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_kelas.required'      => 'Nama kelas wajib diisi.',
            'program_belajar.required' => 'Program belajar wajib diisi.',
            'ustadz_id.required'       => 'Ustadz pengampu wajib dipilih.',
            'ustadz_id.exists'         => 'Ustadz yang dipilih tidak ditemukan.',
            'santri_ids.array'         => 'Data santri tidak valid.',
            'santri_ids.*.exists'      => 'Salah satu santri yang dipilih tidak ditemukan.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data kelas tidak valid.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
