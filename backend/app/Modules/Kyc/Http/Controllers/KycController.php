<?php

namespace App\Modules\Kyc\Http\Controllers;

use App\Models\KycSubmission;
use App\Modules\Kyc\Services\KycService;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KycController {
    public function __construct(private KycService $kycService, private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $submissions = KycSubmission::with('customer', 'submittedBy', 'vettedBy')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($submissions);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'customer_id' => 'nullable|uuid|exists:customers,id|unique:kyc_submissions',
                'business_name' => 'required|string|max:255',
                'business_type' => 'required|string|max:100',
                'address' => 'required|string',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'country' => 'required|string|max:100',
                'phone' => 'required|string|max:20',
                'email' => 'required|email',
                'identification_type' => 'required|string|max:50',
                'identification_number' => 'required|string|max:100|unique:kyc_submissions',
                'form_selection' => 'required|in:form_attached,no_form',
                'identification_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'signed_form' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            ]);

            $idPath = $request->file('identification_file')->store('kyc/identification', 'private');
            $signedPath = $request->file('signed_form')?->store('kyc/signed_forms', 'private');

            $validated['submitted_by'] = $request->authUser->sub;
            $validated['identification_file_path'] = $idPath;
            $validated['signed_form_path'] = $signedPath;
            $validated['status'] = 'pending';

            $submission = KycSubmission::create($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'kyc_submissions',
                'entity_id' => $submission->id,
                'after_snapshot' => $submission->toArray(),
            ]);

            return response()->json($submission, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse {
        $submission = KycSubmission::with('customer', 'submittedBy', 'vettedBy')->findOrFail($id);
        return response()->json($submission);
    }

    public function approve(Request $request, string $id): JsonResponse {
        try {
            $validated = $request->validate([
                'notes' => 'nullable|string',
            ]);

            $submission = $this->kycService->approve($id, $request->authUser->sub, $validated['notes'] ?? null);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'kyc_submissions',
                'entity_id' => $id,
                'after_snapshot' => $submission->toArray(),
                'metadata' => ['action' => 'approved'],
            ]);

            return response()->json($submission);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function reject(Request $request, string $id): JsonResponse {
        try {
            $validated = $request->validate([
                'reason' => 'required|string',
            ]);

            $submission = $this->kycService->reject($id, $request->authUser->sub, $validated['reason']);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'kyc_submissions',
                'entity_id' => $id,
                'after_snapshot' => $submission->toArray(),
                'metadata' => ['action' => 'rejected', 'reason' => $validated['reason']],
            ]);

            return response()->json($submission);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
