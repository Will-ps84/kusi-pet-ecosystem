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

export function Logo({
  showSlogan = false,
  sloganPosition = "bottom",
  size = "md",
  linkTo = "/",
  className,
}: LogoProps) {
  const sizeConfig = {
    sm: {
      logoHeight: "hh-68",
      slogan: "text-xs",
    },
    md: {
      logoHeight: "h-8",
      slogan: "text-sm",
    },
    lg: {
      logoHeight: "h-10",
      slogan: "text-base",
    },
    xl: {
      logoHeight: "h-20",
      slogan: "text-lg",
    },
  };

  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex", sloganPosition === "bottom" ? "flex-col" : "flex-row items-center gap-4", className)}>
      <div className="flex items-center">
        <img
          src={logoImage}
          alt="Kusi Pet - El ecosistema inteligente para el bienestar total de tu mascota"
          className={cn(config.logoHeight, "w-auto object-contain")}
        />
      </div>
      {showSlogan && (
        <p className={cn("text-muted-foreground max-w-xs", config.slogan, sloganPosition === "bottom" ? "mt-2" : "")}>
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
