<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class BulkAbsensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kelas_id'           => ['required', 'integer', 'exists:kelas,id'],
            'tanggal'            => ['required', 'date', 'before_or_equal:today'],
            'absensi'            => ['required', 'array', 'min:1'],
            'absensi.*.santri_id'=> ['required', 'integer', 'exists:santris,id'],
            'absensi.*.status'   => ['required', 'in:hadir,sakit,izin,alfa'],
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id.required'            => 'Kelas wajib dipilih.',
            'kelas_id.exists'              => 'Kelas tidak ditemukan.',
            'tanggal.required'             => 'Tanggal absensi wajib diisi.',
            'tanggal.before_or_equal'      => 'Tanggal absensi tidak boleh melebihi hari ini.',
            'absensi.required'             => 'Data absensi santri wajib diisi.',
            'absensi.min'                  => 'Minimal harus ada 1 data absensi.',
            'absensi.*.santri_id.required' => 'ID santri wajib ada di setiap baris absensi.',
            'absensi.*.santri_id.exists'   => 'Salah satu santri tidak ditemukan.',
            'absensi.*.status.required'    => 'Status kehadiran wajib diisi untuk setiap santri.',
            'absensi.*.status.in'          => 'Status hanya boleh: hadir, sakit, izin, atau alfa.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data absensi tidak valid.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}