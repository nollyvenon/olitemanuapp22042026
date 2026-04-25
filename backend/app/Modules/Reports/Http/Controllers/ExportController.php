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

            $content = file_get_contents($tempFile);
            @unlink($tempFile);

            return response($content, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $validated['filename'] . '"',
                'Content-Length' => strlen($content),
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
            ]);
        } catch (\Exception $e) {
            return response(['error' => 'Failed to generate Excel file: ' . $e->getMessage()], 500);
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
            $pdf->SetDefaultMonospacedFont(\PDF_FONT_MONOSPACED);
            $pdf->SetMargins(5, 10, 5);
            $pdf->AddPage('L'); // Landscape mode for better column spacing
            $pdf->SetFont('helvetica', 'B', 14);
            $pdf->Cell(0, 8, $validated['title'], 0, 1, 'C');
            $pdf->SetFont('helvetica', '', 9);
            $pdf->Ln(3);

            // Calculate column widths - distribute evenly across page width
            $numCols = count($validated['headers']);
            $pageWidth = $pdf->GetPageWidth() - 10; // Account for margins (5+5)
            $colWidth = $pageWidth / $numCols;

            // Print headers with better styling
            $pdf->SetFont('helvetica', 'B', 7);
            $pdf->SetFillColor(220, 220, 220);
            $pdf->SetDrawColor(0, 0, 0);
            $pdf->SetLineWidth(0.3);

            foreach ($validated['headers'] as $header) {
                // Truncate header text to fit column width
                $text = substr($header, 0, 18);
                $pdf->Cell($colWidth, 5, $text, 1, 0, 'C', true);
            }
            $pdf->Ln();

            // Print rows
            $pdf->SetFont('helvetica', '', 6.5);
            $pdf->SetFillColor(255, 255, 255);
            foreach ($validated['rows'] as $row) {
                foreach ($row as $cell) {
                    // Truncate cell text to fit column width
                    $text = substr((string)$cell, 0, 22);
                    $pdf->Cell($colWidth, 4, $text, 1, 0, 'L');
                }
                $pdf->Ln();
            }

            $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
            $pdf->Output($tempFile, 'F');

            $content = file_get_contents($tempFile);
            @unlink($tempFile);

            return response($content, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $validated['filename'] . '"',
                'Content-Length' => strlen($content),
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
            ]);
        } catch (\Exception $e) {
            return response(['error' => 'Failed to generate PDF file: ' . $e->getMessage()], 500);
        }
    }
}
