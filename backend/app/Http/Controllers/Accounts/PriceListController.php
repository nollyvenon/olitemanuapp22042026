<?php
namespace App\Http\Controllers\Accounts;
use App\Http\Controllers\Controller;
use App\Models\Accounts\PriceList;
use App\Services\Accounts\PriceListService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
class PriceListController extends Controller
{
    public function __construct(private PriceListService $priceListService) {}
    public function uploadPriceList(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'price_category_id' => 'required|uuid|exists:price_categories,id',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|uuid|exists:products,id',
                'items.*.price' => 'required|numeric|min:0.01',
            ]);
            $filePath = $request->file('file')?->store('price-lists', 's3') ?? 'uploaded';
            $validated['file_path'] = $filePath;
            $priceList = $this->priceListService->uploadPriceList($validated, $request->user());
            return response()->json($priceList->load('items.product'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
    public function getPriceLists(Request $request): JsonResponse
    {
        $categoryId = $request->query('category_id');
        $lists = PriceList::where('price_category_id', $categoryId)->with('items.product', 'uploader')->orderBy('version', 'desc')->paginate(10);
        return response()->json($lists);
    }
    public function getActivePriceList(Request $request): JsonResponse
    {
        $categoryId = $request->query('category_id');
        $list = PriceList::where('price_category_id', $categoryId)->where('is_active', true)->with('items.product')->first();
        return response()->json($list);
    }
}
