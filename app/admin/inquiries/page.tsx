import { redirect } from 'next/navigation'

/** The boards live at /admin/inquiries/<board>; membership is home base. */
export default function AdminInquiriesIndex() {
  redirect('/admin/inquiries/membership')
}
