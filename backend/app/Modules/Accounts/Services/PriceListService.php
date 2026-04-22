<?php

namespace App\Modules\Accounts\Services;

use App\Models\PriceListItem;
use App\Models\PriceListVersion;
use Illuminate\Support\Facades\DB;

class PriceListService {
    public function upload(array $data, array $items, string $userId): PriceListVersion {
        return DB::transaction(function () use ($data, $items, $userId) {
            $version = PriceListVersion::create([
                'name' => $data['name'],
                'version' => 'v' . now()->format('YmdHis'),
                'uploaded_by' => $userId,
                'effective_from' => $data['effective_from'] ?? null,
                'effective_to' => $data['effective_to'] ?? null,
            ]);

            $records = array_map(fn($item) => [
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'version_id' => $version->id,
                'item_id' => $item['item_id'],
                'price' => $item['price'],
                'min_qty' => $item['min_qty'] ?? 1,
                'currency' => $item['currency'] ?? 'NGN',
            ], $items);

            PriceListItem::insert($records);

            return $version->load('items');
        });
    }

    public function activate(string $versionId, string $userId): PriceListVersion {
        return DB::transaction(function () use ($versionId, $userId) {
            PriceListVersion::where('is_current', true)->update(['is_current' => false, 'status' => 'archived']);

            $version = PriceListVersion::findOrFail($versionId);
            $version->update(['status' => 'active', 'is_current' => true, 'approved_by' => $userId]);

            return $version;
        });
    }

    public function getPriceForItem(string $itemId, ?string $versionId = null): ?float {
        $version = $versionId
            ? PriceListVersion::findOrFail($versionId)
            : PriceListVersion::where('is_current', true)->first();

        if (!$version) return null;

        return (float) PriceListItem::where('version_id', $version->id)->where('item_id', $itemId)->value('price');
    }
}
