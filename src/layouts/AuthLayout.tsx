// Layout pour les pages d'authentification
import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-[#203C86]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_35%)]" />
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto border border-white/10">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-white">
            Plateforme de Bourses
          </h1>
          <p className="text-white/75 text-sm leading-relaxed">
            Mairie de Dakar — Digitalisez vos demandes de bourses d'études.
            Suivez l'avancement de vos dossiers en toute transparence.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="h-1 w-8 rounded-full bg-white/30" />
            <div className="h-1 w-8 rounded-full bg-white/60" />
            <div className="h-1 w-8 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
