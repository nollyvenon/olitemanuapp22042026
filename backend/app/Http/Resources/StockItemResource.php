<?php namespace App\Http\Resources; use Illuminate\Http\Resources\Json\JsonResource; class StockItemResource extends JsonResource { public function toArray($req) { return $this->resource; } }
