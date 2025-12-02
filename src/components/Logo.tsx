import { Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  showSlogan?: boolean;
  sloganPosition?: 'bottom' | 'side';
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string | null;
  className?: string;
}

export function Logo({
  showSlogan = false,
  sloganPosition = 'bottom',
  size = 'md',
  linkTo = '/',
  className,
}: LogoProps) {
  const sizeConfig = {
    sm: {
      icon: 'h-8 w-8',
      iconInner: 'h-4 w-4',
      text: 'text-xl',
      slogan: 'text-xs',
    },
    md: {
      icon: 'h-10 w-10',
      iconInner: 'h-6 w-6',
      text: 'text-3xl',
      slogan: 'text-sm',
    },
    lg: {
      icon: 'h-14 w-14',
      iconInner: 'h-8 w-8',
      text: 'text-4xl',
      slogan: 'text-base',
    },
  };

  const config = sizeConfig[size];

  const logoContent = (
    <div
      className={cn(
        'flex',
        sloganPosition === 'bottom' ? 'flex-col' : 'flex-row items-center gap-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex items-center justify-center bg-gradient-hero shadow-glow rounded-3xl',
            config.icon
          )}
        >
          <PawPrint className={cn('text-primary-foreground', config.iconInner)} />
        </div>
        <span className={cn('font-bold text-foreground', config.text)}>
          Kusi <span className="text-primary">Pet</span>
        </span>
      </div>
      {showSlogan && (
        <p
          className={cn(
            'text-muted-foreground max-w-xs',
            config.slogan,
            sloganPosition === 'bottom' ? 'mt-2' : ''
          )}
        >
          El ecosistema inteligente para el bienestar total de tu mascota.
        </p>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="transition-transform hover:scale-105">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
