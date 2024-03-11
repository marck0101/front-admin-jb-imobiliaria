import { useAuth } from '../contexts/auth';
import { AdminRoutes } from './admin.routes';
import { AuthRoutes } from './auth.routes';

export function Routes() {
  const { user } = useAuth();

  if (!user._id) return <AuthRoutes />;

  return <AdminRoutes />;
}
