import { redirect } from 'next/navigation';

export default function AdminRolesRedirectPage() {
  redirect('/dashboard/admin/groups');
}
