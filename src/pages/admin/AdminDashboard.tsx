import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ClipboardList, TrendingUp, BarChart3, ArrowRight, Activity } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAnalyticsPage = location.pathname === '/analytics';

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications', 'admin-dashboard'],
    queryFn: () => api.getApplications({ limit: '50' }),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'admin-dashboard'],
    queryFn: () => api.getUsers({ limit: 50 }),
  });

  const approvalRate = applications.length
    ? Math.round((applications.filter((application) => application.status === 'approved').length / applications.length) * 100)
    : 0;
  const recentApplications = [...applications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const recentUsers = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const staffCount = users.filter((user) => user.role === 'admin' || user.role === 'municipal').length;
  const monthlyApplicationsData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
    const now = new Date();
    const monthEntries = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      return {
        key,
        label: formatter.format(date),
        value: 0,
      };
    });

    const monthMap = new Map(monthEntries.map((entry) => [entry.key, entry]));

    applications.forEach((application) => {
      const createdAt = new Date(application.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const target = monthMap.get(key);
      if (target) {
        target.value += 1;
      }
    });

    return monthEntries;
  }, [applications]);
  const statusDistributionData = useMemo(() => {
    const config = [
      { key: 'submitted', label: 'Soumises', color: '#2563EB' },
      { key: 'review', label: 'En analyse', color: '#3B82F6' },
      { key: 'approved', label: 'Approuvees', color: '#10B981' },
      { key: 'rejected', label: 'Refusees', color: '#F97316' },
      { key: 'draft', label: 'Brouillons', color: '#94A3B8' },
    ] as const;

    return config.map((item) => ({
      name: item.label,
      value: applications.filter((application) => application.status === item.key).length,
      color: item.color,
    }));
  }, [applications]);
  const roleDistributionData = useMemo(() => ([
    {
      name: 'Etudiants',
      value: users.filter((user) => user.role === 'student').length,
      color: '#2563EB',
    },
    {
      name: 'Responsables',
      value: users.filter((user) => user.role === 'municipal').length,
      color: '#0F172A',
    },
    {
      name: 'Admins',
      value: users.filter((user) => user.role === 'admin').length,
      color: '#93C5FD',
    },
  ]), [users]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-hero overflow-hidden px-6 py-6 md:px-8 md:py-7">
        <h1 className="text-2xl font-bold font-heading">Tableau de bord Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d ensemble de la plateforme</p>
      </div>

      {!isAnalyticsPage && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Utilisateurs" value={users.length} icon={Users} variant="primary" />
            <StatCard title="Demandes" value={applications.length} icon={ClipboardList} variant="warning" />
            <StatCard title="Taux approbation" value={approvalRate + '%'} icon={TrendingUp} variant="success" />
            <StatCard title="Equipe active" value={staffCount} icon={Activity} description="Admins et agents" />
          </div>

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
            <Card className="dashboard-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-heading">Dernieres demandes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/applications')}>
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicationsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
                  ) : recentApplications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucune demande disponible</p>
                  ) : (
                    recentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="dashboard-row flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{application.studentName}</p>
                          <p className="text-xs text-muted-foreground">{application.reference} · {formatDate(application.createdAt)}</p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-heading">Utilisateurs recents</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/users')}>
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usersLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
                  ) : recentUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur disponible</p>
                  ) : (
                    recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="dashboard-row flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-xs font-bold text-primary">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-muted px-3 py-1 rounded-full border border-slate-200 bg-white capitalize">{user.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isAnalyticsPage && (
        <Card className="dashboard-surface">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Evolution des demandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-[24px] border border-[#DBEAFE] bg-[linear-gradient(180deg,rgba(239,246,255,0.92)_0%,rgba(255,255,255,1)_100%)] px-3 pb-3 pt-4">
              <div className="space-y-3">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyApplicationsData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="applicationsAreaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#DBEAFE" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        width={28}
                      />
                      <Tooltip
                        cursor={{ stroke: '#93C5FD', strokeDasharray: '4 4' }}
                        contentStyle={{
                          borderRadius: 16,
                          border: '1px solid rgba(191, 219, 254, 1)',
                          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fill="url(#applicationsAreaFill)"
                        dot={{ r: 0 }}
                        activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">{applications.length} demandes et {approvalRate}% approbation actuellement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAnalyticsPage && (
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          <Card className="dashboard-surface">
            <CardHeader>
              <CardTitle className="text-base font-heading">Repartition des statuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.15fr_0.85fr] md:items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {statusDistributionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 16,
                          border: '1px solid rgba(191, 219, 254, 1)',
                          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {statusDistributionData.map((entry) => (
                    <div key={entry.name} className="dashboard-row flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-foreground">{entry.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-surface">
            <CardHeader>
              <CardTitle className="text-base font-heading">Utilisateurs par role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleDistributionData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }} barSize={34}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      width={28}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(219, 234, 254, 0.35)' }}
                      contentStyle={{
                        borderRadius: 16,
                        border: '1px solid rgba(191, 219, 254, 1)',
                        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Bar dataKey="value" radius={[16, 16, 6, 6]}>
                      {roleDistributionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
