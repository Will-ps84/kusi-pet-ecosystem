import { Link, useNavigate } from 'react-router-dom';
import { User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/Logo';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const {
    user,
    profile,
    signOut,
    hasRole
  } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = hasRole('admin');

  // Public navigation - Marketplace marked as "Próximamente"
  const publicNavLinks = [
    {
      href: '/comunidad',
      label: 'Comunidad'
    },
  ];

  // User-specific navigation (only when logged in)
  const userNavLinks = user ? [
    {
      href: '/mis-mascotas',
      label: 'Mis Mascotas'
    }
  ] : [];

  // Admin-only navigation (marketplace + carrito)
  const adminNavLinks = isAdmin ? [
    {
      href: '/marketplace',
      label: 'Marketplace'
    },
    {
      href: '/carrito',
      label: 'Carrito'
    }
  ] : [];

  // Combine all nav links for display
  const navLinks = [...publicNavLinks, ...userNavLinks, ...adminNavLinks];

  /**
   * Header Component - Kusi Pet
   * 
   * Cambios de alineación (Enero 2025):
   * - Container usa flex items-center para alinear logo y navegación verticalmente
   * - Logo y nav están al mismo nivel vertical gracias a items-center
   * - Height fijo de h-16 (64px) para consistencia
   */
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - alineado verticalmente con items-center del contenedor padre */}
        <Logo size="md" />

        {/* Desktop Navigation - items-center para alinear con el logo */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              to={link.href} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Marketplace "Próximamente" badge for non-admin users */}
          {!isAdmin && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
              Marketplace
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                Próximamente
              </Badge>
            </span>
          )}

          {/* Admin link - only visible to admins */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mi-perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mis-mascotas">Mis Mascotas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="sm">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                to={link.href} 
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary" 
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Marketplace "Próximamente" for non-admin users on mobile */}
            {!isAdmin && (
              <span className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                Marketplace
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                  Próximamente
                </Badge>
              </span>
            )}

            {/* Admin link - only visible to admins on mobile */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="rounded-lg px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-muted" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            {!user && (
              <div className="flex gap-2 pt-2">
                <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" className="w-full">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
