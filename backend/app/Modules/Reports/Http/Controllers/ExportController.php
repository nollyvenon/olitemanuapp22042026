<?php

namespace App\Modules\Reports\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Http\Request;

class ExportController {
    public function exportExcel(Request $request): Response {
        $validated = $request->validate([
            'headers' => 'required|array',
            'rows' => 'required|array',
            'filename' => 'required|string',
        ]);

        try {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Add headers
            foreach ($validated['headers'] as $col => $header) {
                $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
            }

            // Add rows
            foreach ($validated['rows'] as $row => $data) {
                foreach ($data as $col => $value) {
                    $sheet->setCellValueByColumnAndRow($col + 1, $row + 2, $value);
                }
            }

            // Auto-adjust column widths
            foreach ($sheet->getColumnIterator() as $column) {
                $sheet->getColumnDimension($column->getColumnIndex())->setAutoSize(true);
            }

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $tempFile = tempnam(sys_get_temp_dir(), 'xlsx_');
            $writer->save($tempFile);

            return response()->download($tempFile, $validated['filename'], [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend();
        } catch (\Exception $e) {
            return response(['error' => 'Failed to generate Excel file'], 500);
        }
    }

    public function exportPDF(Request $request): Response {
        $validated = $request->validate([
            'headers' => 'required|array',
            'rows' => 'required|array',
            'title' => 'required|string',
            'filename' => 'required|string',
        ]);

        try {
            $pdf = new \TCPDF();
            $pdf->AddPage();
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(0, 10, $validated['title'], 0, 1, 'C');
            $pdf->SetFont('Arial', '', 10);
            $pdf->Ln(5);

            // Create table
            $pdf->SetFont('Arial', 'B', 9);
            $colWidths = array_fill(0, count($validated['headers']), 190 / count($validated['headers']));

            foreach ($validated['headers'] as $header) {
                $pdf->MultiCell($colWidths[0], 5, $header, 1, 'C');
            }

            $pdf->SetFont('Arial', '', 8);
            foreach ($validated['rows'] as $row) {
                foreach ($row as $cell) {
                    $pdf->MultiCell($colWidths[0], 5, (string)$cell, 1, 'L');
                }
                $pdf->Ln();
            }

            $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
            $pdf->Output($tempFile, 'F');

            return response()->download($tempFile, $validated['filename'], [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend();
        } catch (\Exception $e) {
            return response(['error' => 'Failed to generate PDF file'], 500);
        }
    }
}
