import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/Logo';

export function Header() {
  const {
    user,
    profile,
    signOut,
    hasRole
  } = useAuth();
  const {
    itemCount
  } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const navLinks = [{
    href: '/marketplace',
    label: 'Marketplace'
  }, ...(user ? [{
    href: '/mi-avatar',
    label: 'Mi Avatar'
  }, {
    href: '/mis-pedidos',
    label: 'Mis Pedidos'
  }, {
    href: '/mis-mascotas',
    label: 'Mis Mascotas'
  }] : [])];
  return <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 items-center justify-between flex flex-row">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>)}
          {hasRole('admin') && <Link to="/admin" className="text-sm font-medium text-accent transition-colors hover:text-accent/80">
              Admin
            </Link>}
          {hasRole('vendor') && <Link to="/vendor" className="text-sm font-medium text-accent transition-colors hover:text-accent/80">
              Vendedor
            </Link>}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {itemCount}
                </span>}
            </Button>
          </Link>

          {/* User Menu */}
          {user ? <DropdownMenu>
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
                <DropdownMenuItem asChild>
                  <Link to="/mis-pedidos">Mis Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <div className="hidden items-center gap-2 sm:flex">
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
            </div>}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && <div className="border-t border-border md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            {navLinks.map(link => <Link key={link.href} to={link.href} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>)}
            {hasRole('admin') && <Link to="/admin" className="rounded-lg px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>}
            {!user && <div className="flex gap-2 pt-2">
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
              </div>}
          </nav>
        </div>}
    </header>;
}