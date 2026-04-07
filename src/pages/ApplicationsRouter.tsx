// Routeur vers la bonne page de demandes selon le rôle
import { useAuth } from '@/context/AuthContext';
import MyApplicationsPage from '@/pages/student/MyApplicationsPage';
import AllApplicationsPage from '@/pages/AllApplicationsPage';

const ApplicationsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <MyApplicationsPage />;
  return <AllApplicationsPage />;
};

export default ApplicationsRouter;
