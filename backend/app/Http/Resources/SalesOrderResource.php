<?php namespace App\Http\Resources; use Illuminate\Http\Resources\Json\JsonResource; class SalesOrderResource extends JsonResource { public function toArray($req) { return $this->resource; } }
