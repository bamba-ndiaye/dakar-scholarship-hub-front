// Composant qui redirige vers le bon dashboard selon le rôle
import { useAuth } from '@/context/AuthContext';
import StudentDashboard from '@/pages/student/StudentDashboard';
import MunicipalDashboard from '@/pages/municipal/MunicipalDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'municipal':
      return <MunicipalDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default DashboardRouter;
