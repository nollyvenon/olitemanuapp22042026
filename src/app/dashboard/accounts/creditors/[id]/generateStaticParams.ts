// This file enables static export for dynamic [id] route in creditors

export async function generateStaticParams() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/accounts/creditors`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data ?? [];
  return list.map((creditor: { id: string | number }) => ({ id: creditor.id?.toString() }));
}
