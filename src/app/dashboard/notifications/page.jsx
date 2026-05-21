import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getNotificationsAction } from '@/app/actions';
import NotificationsInbox from './notifications-inbox';

export const metadata = {
  title: 'Bildirimlerim | Dashboard',
};

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch notifications for the logged-in user (up to 200 items)
  const result = await getNotificationsAction(200);
  const notifications = result?.notifications || [];

  return (
    <NotificationsInbox
      initialNotifications={serialize(notifications)}
      session={{ userId: session.userId, username: session.username, role: session.role }}
    />
  );
}
