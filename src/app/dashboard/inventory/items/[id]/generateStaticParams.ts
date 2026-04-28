// This file enables static export for dynamic [id] route in inventory items

export async function generateStaticParams() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/inventory/items`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data ?? [];
  return list.map((item: { id: string | number }) => ({ id: item.id?.toString() }));
}
