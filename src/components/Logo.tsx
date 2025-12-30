import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/kusi-pet-logo.png';

interface LogoProps {
  showSlogan?: boolean;
  sloganPosition?: 'bottom' | 'side';
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string | null;
  className?: string;
  variant?: 'full' | 'compact'; // full = logo con texto, compact = solo isotipo
}

export function Logo({
  showSlogan = false,
  sloganPosition = 'bottom',
  size = 'md',
  linkTo = '/',
  className,
  variant = 'full',
}: LogoProps) {
  const sizeConfig = {
    sm: {
      logoHeight: 'h-8',
      text: 'text-xl',
      slogan: 'text-xs',
    },
    md: {
      logoHeight: 'h-10',
      text: 'text-2xl',
      slogan: 'text-sm',
    },
    lg: {
      logoHeight: 'h-14',
      text: 'text-3xl',
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
      <div className="flex items-center">
        <img 
          src={logoImage} 
          alt="Kusi Pet - El ecosistema inteligente para el bienestar total de tu mascota" 
          className={cn(config.logoHeight, 'w-auto object-contain')}
        />
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