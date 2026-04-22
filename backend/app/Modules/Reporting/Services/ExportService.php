<?php

namespace App\Modules\Reporting\Services;

class ExportService {
    public function exportCsv(array $data, string $filename): string {
        $csv = fopen('php://temp', 'r+');
        if (empty($data)) return '';

        fputcsv($csv, array_keys($data[0]));
        foreach ($data as $row) fputcsv($csv, $row);

        rewind($csv);
        $contents = stream_get_contents($csv);
        fclose($csv);

        return $contents;
    }

    public function exportPdf(array $data, string $title): string {
        $html = "<h1>$title</h1>";
        $html .= "<table border='1' cellpadding='10'><tr>";
        if (!empty($data)) {
            foreach (array_keys($data[0]) as $key) {
                $html .= "<th>$key</th>";
            }
            $html .= "</tr>";
            foreach ($data as $row) {
                $html .= "<tr>";
                foreach ($row as $val) $html .= "<td>$val</td>";
                $html .= "</tr>";
            }
        }
        $html .= "</table>";

        return $html;
    }
}
