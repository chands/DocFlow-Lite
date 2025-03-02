import { Outlet } from 'react-router';
import { Toaster } from '~/components/ui/sonner';
import { AppLayout } from '~/features/layout/AppLayout';

/**
 * Root layout component
 */
export default function Layout() {
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster />
    </>
  );
} 