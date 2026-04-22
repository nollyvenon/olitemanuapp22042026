<?php
namespace App\Services\Accounts;
use App\Models\Accounts\PriceList;
use App\Models\Accounts\PriceListItem;
use App\Models\User;
use Illuminate\Support\Str;

class PriceListService
{
    public function uploadPriceList(array $data, User $uploader): PriceList
    {
        $lastVersion = PriceList::where('price_category_id', $data['price_category_id'])
            ->max('version') ?? 0;

        $priceList = PriceList::create([
            'id' => Str::uuid(),
            'price_category_id' => $data['price_category_id'],
            'version' => $lastVersion + 1,
            'file_path' => $data['file_path'],
            'uploaded_by' => $uploader->id,
            'is_active' => true,
        ]);

        foreach ($data['items'] as $item) {
            PriceListItem::create([
                'id' => Str::uuid(),
                'price_list_id' => $priceList->id,
                'product_id' => $item['product_id'],
                'price' => $item['price'],
            ]);
        }

        PriceList::where('price_category_id', $data['price_category_id'])
            ->where('id', '!=', $priceList->id)
            ->update(['is_active' => false]);

        return $priceList;
    }

    public function getActivePrice($productId, $categoryId)
    {
        $priceList = PriceList::where('price_category_id', $categoryId)
            ->where('is_active', true)
            ->latest('version')
            ->first();

        if (!$priceList) return null;

        return $priceList->items()
            ->where('product_id', $productId)
            ->first();
    }
}
