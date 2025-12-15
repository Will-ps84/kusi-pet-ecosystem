import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock } from 'lucide-react';

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </Layout>
    );
  }

  // If user is admin, show the content
  if (user && hasRole('admin')) {
    return <>{children}</>;
  }

  // Show "Coming Soon" page for non-admins
  return (
    <Layout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Marketplace Próximamente
        </h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          Estamos preparando una experiencia de compra increíble para ti y tu mascota. 
          ¡Muy pronto podrás encontrar los mejores productos aquí!
        </p>
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Lanzamiento en 2025</span>
        </div>
        <div className="mt-8">
          <Link to="/comunidad">
            <Button variant="hero">
              Explorar Comunidad
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
