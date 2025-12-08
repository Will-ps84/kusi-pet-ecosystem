import { Heart, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="sm" showSlogan sloganPosition="bottom" />
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Explorar</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/comunidad" className="transition-colors hover:text-primary">
                  Comunidad
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="transition-colors hover:text-primary">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Marketplace (Próximamente)
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Soporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terminos" className="transition-colors hover:text-primary">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="transition-colors hover:text-primary">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="transition-colors hover:text-primary">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Contacto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>comunidad@kusipet.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+51 997 227 638</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kusi Pet. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Hecho con <Heart className="h-4 w-4 fill-accent text-accent" /> en Perú
          </p>
        </div>
      </div>
    </footer>
  );
}