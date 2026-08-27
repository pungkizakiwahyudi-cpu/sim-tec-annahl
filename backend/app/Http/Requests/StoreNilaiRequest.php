<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreNilaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kelas_id'    => ['required', 'integer', 'exists:kelas,id'],
            'santri_id'   => ['required', 'integer', 'exists:santris,id'], 
            'tanggal'     => ['required', 'date', 'before_or_equal:today'],
            'hafalan_baru'=> ['nullable', 'string', 'max:500'],
            'murojaah'    => ['nullable', 'string', 'max:500'],
            'nilai_tajwid'=> ['nullable', 'integer', 'min:0', 'max:100'],
            'catatan'     => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id.required'    => 'Kelas wajib dipilih.',
            'kelas_id.exists'      => 'Kelas tidak ditemukan.',
            'santri_id.required'   => 'Santri wajib dipilih.',
            'santri_id.exists'     => 'Santri tidak ditemukan.',
            'tanggal.required'     => 'Tanggal penilaian wajib diisi.',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh melebihi hari ini.',
            'nilai_tajwid.integer' => 'Nilai tajwid harus berupa angka.',
            'nilai_tajwid.min'     => 'Nilai tajwid minimal 0.',
            'nilai_tajwid.max'     => 'Nilai tajwid maksimal 100.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data nilai tidak valid.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}