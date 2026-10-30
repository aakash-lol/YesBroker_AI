import { redirect } from 'next/navigation';

// Replaces the old mock "System Control" dashboard (it showed hard-coded fake data).
export default function AdminIndex() {
  redirect('/admin/properties');
}
