import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/kusi-pet-logo.png";

interface LogoProps {
  showSlogan?: boolean;
  sloganPosition?: "bottom" | "side";
  size?: "sm" | "md" | "lg" | "xl";
  linkTo?: string | null;
  className?: string;
}

/**
 * Logo Component - Kusi Pet
 * 
 * Cambios de alineación (Enero 2025):
 * - Se agregó flex items-center al contenedor principal para alinear verticalmente
 * - La imagen usa object-contain para mantener proporciones sin distorsión
 * - Se eliminaron contenedores innecesarios para simplificar el layout
 * - El logo se centra automáticamente con el menú de navegación gracias a items-center en el header
 */
export function Logo({
  showSlogan = false,
  sloganPosition = "bottom",
  size = "md",
  linkTo = "/",
  className,
}: LogoProps) {
  const sizeConfig = {
    sm: {
      logoHeight: "h-8",
      slogan: "text-xs",
    },
    md: {
      logoHeight: "h-10",
      slogan: "text-sm",
    },
    lg: {
      logoHeight: "h-14",
      slogan: "text-base",
    },
    xl: {
      logoHeight: "h-18",
      slogan: "text-lg",
    },
  };

  const config = sizeConfig[size];

  const logoContent = (
    <div 
      className={cn(
        "flex items-center", 
        sloganPosition === "bottom" ? "flex-col items-start" : "flex-row gap-4", 
        className
      )}
    >
      {/* Logo image - centrado verticalmente */}
      <img
        src={logoImage}
        alt="Kusi Pet - El ecosistema inteligente para el bienestar total de tu mascota"
        className={cn(config.logoHeight, "w-auto object-contain")}
      />
      {showSlogan && (
        <p className={cn(
          "text-muted-foreground max-w-xs leading-tight", 
          config.slogan, 
          sloganPosition === "bottom" ? "mt-1" : ""
        )}>
          El ecosistema inteligente para el bienestar total de tu mascota.
        </p>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link 
        to={linkTo} 
        className="flex items-center transition-transform hover:scale-105"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
