<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UploadBuktiInfaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bukti_transfer' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048', // Maksimal 2MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'bukti_transfer.required' => 'File bukti transfer wajib diunggah.',
            'bukti_transfer.file'     => 'Upload harus berupa file.',
            'bukti_transfer.image'    => 'File harus berupa gambar yang valid.',
            'bukti_transfer.mimes'    => 'Format file harus JPG, PNG, atau PDF.',
            'bukti_transfer.max'      => 'Ukuran file maksimal 2MB.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'File bukti transfer tidak valid.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}