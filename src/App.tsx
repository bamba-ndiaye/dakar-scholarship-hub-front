import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Layouts
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Pages Auth
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

// Pages Dashboard
import StudentDashboard from "@/pages/student/StudentDashboard";
import MunicipalDashboard from "@/pages/municipal/MunicipalDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Pages App
import ApplicationsRouter from "@/pages/ApplicationsRouter";
import NewApplicationPage from "@/pages/student/NewApplicationPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";
import MessagesPage from "@/pages/MessagesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/admin/UsersPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    switch (user.role) {
      case 'student':
        return <Navigate to="/dashboard/student" replace />;
      case 'municipal':
        return <Navigate to="/dashboard/municipal" replace />;
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes authentification */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Routes applicatives (dashboard) */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              {/* Dashboard par rôle */}
              <Route path="/dashboard/student" element={<StudentDashboard />} />
              <Route path="/dashboard/municipal" element={<MunicipalDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              
              {/* Routes principales - redirection selon rôle */}
              <Route path="/" element={<Navigate to="/dashboard/student" replace />} />
              
              {/* Applications */}
              <Route path="/applications" element={
                <ProtectedRoute allowedRoles={['student', 'municipal', 'admin']}>
                  <ApplicationsRouter />
                </ProtectedRoute>
              } />
              <Route path="/applications/new" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <NewApplicationPage />
                </ProtectedRoute>
              } />
              <Route path="/applications/:id" element={<ApplicationDetailPage />} />
              
              {/* Messages */}
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['student', 'municipal']}>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              
              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsPage />} />
              
              {/* Paramètres */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<SettingsPage />} />
              
              {/* Admin routes */}
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/managers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
