<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    public static function log(
        Request $request,
        string $action,
        ?string $modelType = null,
        ?int $modelId = null,
        ?string $description = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        $user = $request->user();

        AuditLog::create([
            'user_id'     => $user?->id,
            'role'        => $user?->role,
            'action'      => $action,
            'model_type'  => $modelType,
            'model_id'    => $modelId,
            'description' => $description,
            'old_values'  => $oldValues,
            'new_values'  => $newValues,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
        ]);
    }
}