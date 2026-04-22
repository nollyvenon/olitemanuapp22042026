<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\ApprovedOrder;
use App\Models\Sales\SalesInvoice;
use App\Services\Sales\AuthorizationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SalesInvoiceController extends Controller
{
    public function __construct(private AuthorizationService $authorizationService) {}

    public function uploadDocuments(Request $request, ApprovedOrder $order): JsonResponse
    {
        try {
            $validated = $request->validate([
                'tally_invoice_file' => 'required|file|mimes:pdf,xlsx,xls',
                'delivery_note_file' => 'required|file|mimes:pdf,xlsx,xls',
            ]);

            $tallyPath = $validated['tally_invoice_file']->store('invoices', 's3');
            $deliveryPath = $validated['delivery_note_file']->store('invoices', 's3');

            $this->authorizationService->uploadInvoiceDocuments($order, $tallyPath, $deliveryPath);

            return response()->json(['message' => 'Documents uploaded successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function authorize(Request $request, ApprovedOrder $order): JsonResponse
    {
        try {
            $insufficientStock = $this->authorizationService->validateStockAvailability($order);

            if (!empty($insufficientStock)) {
                return response()->json([
                    'message' => 'Insufficient stock',
                    'insufficient_items' => $insufficientStock,
                ], 422);
            }

            $validated = $request->validate([
                'authorization_notes' => 'nullable|string|max:500',
            ]);

            $invoice = $order->invoice()->first();
            if (!$invoice || !$invoice->tally_invoice_file || !$invoice->delivery_note_file) {
                throw new \Exception('Documents must be uploaded before authorization');
            }

            $invoice = $this->authorizationService->authorizeInvoice(
                $order,
                $request->user(),
                $invoice->tally_invoice_file,
                $invoice->delivery_note_file,
                $validated['authorization_notes'] ?? null
            );

            return response()->json($invoice->load('approvedOrder'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(SalesInvoice $invoice): JsonResponse
    {
        return response()->json($invoice->load('approvedOrder.items.product'));
    }

    public function list(Request $request): JsonResponse
    {
        $invoices = SalesInvoice::with('approvedOrder.items.product')
            ->paginate(15);

        return response()->json($invoices);
    }
}
