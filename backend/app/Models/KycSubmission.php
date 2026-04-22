<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\Versionable;

class KycSubmission extends Model {
    use HasUuids, Versionable;

    protected $fillable = ['customer_id', 'submitted_by', 'status', 'form_selection', 'business_name', 'business_type', 'address', 'city', 'state', 'country', 'phone', 'email', 'identification_type', 'identification_number', 'identification_file_path', 'signed_form_path', 'vetted_by', 'vetted_at', 'vetting_notes', 'version_number', 'parent_id', 'is_current'];

    protected $casts = ['vetted_at' => 'datetime'];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function submittedBy(): BelongsTo { return $this->belongsTo(User::class, 'submitted_by'); }
    public function vettedBy(): BelongsTo { return $this->belongsTo(User::class, 'vetted_by'); }
}
