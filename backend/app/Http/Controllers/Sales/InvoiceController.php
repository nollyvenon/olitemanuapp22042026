<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $invoices = Invoice::with('customer', 'order')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('limit', 20));

        return response()->json([
            'data' => $invoices->items(),
            'pagination' => [
                'total' => $invoices->total(),
                'page' => $invoices->currentPage(),
                'limit' => $invoices->perPage(),
                'pages' => $invoices->lastPage(),
            ],
        ]);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        if ($invoice->deleted_at) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return response()->json($invoice->load('customer', 'order'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'sometimes|uuid|exists:orders,id',
            'customer_id' => 'required|uuid|exists:users,id',
            'invoice_date' => 'required|date',
            'due_date' => 'sometimes|date',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'sometimes|string',
        ]);

        $invoice = Invoice::create([
            'invoice_number' => 'INV-' . now()->format('YmdHis') . '-' . strtoupper(substr(uniqid(), -6)),
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return response()->json($invoice, 201);
    }

    public function update(Invoice $invoice, Request $request): JsonResponse
    {
        if ($invoice->deleted_at) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:draft,issued,paid,overdue,cancelled',
            'paid_amount' => 'sometimes|numeric|min:0',
            'notes' => 'sometimes|string',
        ]);

        $invoice->update($validated);

        return response()->json($invoice);
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        if ($invoice->deleted_at) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->delete();

        return response()->json(null, 204);
    }
}
