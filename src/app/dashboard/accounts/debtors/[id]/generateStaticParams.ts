// This file enables static export for dynamic [id] route in debtors

export async function generateStaticParams() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/accounts/debtors`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data ?? [];
  return list.map((debtor: { id: string | number }) => ({ id: debtor.id?.toString() }));
}
