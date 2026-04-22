<?php

namespace App\Modules\Kyc\Services;

use App\Events\KycApproved;
use App\Models\KycSubmission;
use App\Models\Customer;
use App\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;

class KycService {
    public function approve(string $submissionId, string $userId, ?string $notes): KycSubmission {
        return DB::transaction(function () use ($submissionId, $userId, $notes) {
            $submission = KycSubmission::lockForUpdate()->findOrFail($submissionId);

            if ($submission->status !== 'pending') {
                throw new \Exception('Submission already vetted', 422);
            }

            $submission->update([
                'status' => 'approved',
                'vetted_by' => $userId,
                'vetted_at' => now(),
                'vetting_notes' => $notes,
            ]);

            if (!$submission->customer_id) {
                $customer = Customer::create([
                    'name' => $submission->business_name,
                    'email' => $submission->email,
                    'phone' => $submission->phone,
                    'address' => $submission->address,
                    'city' => $submission->city,
                    'state' => $submission->state,
                    'country' => $submission->country,
                    'kyc_verified' => true,
                    'created_by' => $userId,
                ]);
                $submission->update(['customer_id' => $customer->id]);
            } else {
                $submission->customer->update(['kyc_verified' => true]);
            }

            KycApproved::dispatch($submission, $userId);

            return $submission;
        });
    }

    public function reject(string $submissionId, string $userId, string $reason): KycSubmission {
        $submission = KycSubmission::findOrFail($submissionId);

        if ($submission->status !== 'pending') {
            throw new \Exception('Submission already vetted', 422);
        }

        $submission->update([
            'status' => 'rejected',
            'vetted_by' => $userId,
            'vetted_at' => now(),
            'vetting_notes' => $reason,
        ]);

        return $submission;
    }
}
