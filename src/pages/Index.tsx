import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CommunitySignupForm } from '@/components/CommunitySignupForm';
import { 
  PawPrint, 
  Sparkles,
  Heart,
  Users,
  Search,
  Home,
  HandHeart,
  Brain,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Crea el perfil de tu mascota',
    description: 'Registra a tu perro o gato con su edad, peso, estilo de vida y necesidades de salud. Así el ecosistema comienza a conocerl@.',
    icon: PawPrint,
  },
  {
    number: '02',
    title: 'Conéctate con la comunidad',
    description: 'Recibe contenido de valor, historias reales, casos de adopción y avisos de mascotas perdidas en Lima para apoyar entre todos.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Recibe recomendaciones inteligentes',
    description: 'Muy pronto nuestra IA te ayudará a tomar mejores decisiones de cuidado (alimentación, salud, servicios) según el perfil de tu mascota y el clima de Lima.',
    icon: Sparkles,
  },
];

const benefits = [
  {
    icon: Brain,
    title: 'IA que piensa en tu mascota',
    description: 'Estamos construyendo un ecosistema que usará inteligencia artificial para ayudarte a tomar mejores decisiones de cuidado en el día a día.',
  },
  {
    icon: MessageCircle,
    title: 'Comunidad pet-parent en Lima',
    description: 'Historias reales, dudas, experiencias y aprendizajes de personas que viven lo mismo que tú con sus perrhijos y gathijos.',
  },
  {
    icon: Search,
    title: 'Mascotas perdidas y adopciones',
    description: 'Daremos visibilidad a casos de mascotas perdidas y promoveremos adopciones responsables junto a refugios y albergues.',
  },
  {
    icon: HandHeart,
    title: 'Apoyo a albergues',
    description: 'Desde el día uno Kusi Pet nace con propósito: conectar a la comunidad con albergues y rescatistas para que más mascotas tengan un hogar.',
  },
];

const communityPurpose = [
  {
    icon: Search,
    title: 'Mascotas perdidas',
    description: 'Publicaremos y ayudaremos a difundir casos de mascotas perdidas en Lima para que vuelvan a casa.',
    emoji: '🔍',
  },
  {
    icon: Heart,
    title: 'Adopciones responsables',
    description: 'Daremos visibilidad a mascotas en busca de familia y compartiremos tips para adoptar de forma responsable.',
    emoji: '❤️',
  },
  {
    icon: Home,
    title: 'Albergues aliados',
    description: 'Estamos construyendo una red de albergues y refugios para apoyar con visibilidad, donaciones y campañas conjuntas.',
    emoji: '🏠',
  },
];

export default function Index() {
  const scrollToForm = () => {
    document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-light/50 to-background pb-20 pt-16 md:pb-32 md:pt-24">
        {/* Decorative elements */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-10 top-40 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <PawPrint className="h-4 w-4" />
              <span>El futuro del cuidado de mascotas en Perú</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              El ecosistema inteligente para el{' '}
              <span className="text-gradient-primary">bienestar total</span>{' '}
              de tu mascota
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Únete a la comunidad Kusi Pet y recibe tips de bienestar, apoyo en casos de mascotas perdidas y acceso anticipado a nuestro ecosistema pet-tech.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full sm:w-auto"
                onClick={scrollToForm}
              >
                <Heart className="h-5 w-5" />
                Quiero ser parte de la comunidad
              </Button>
              
              <p className="max-w-md text-sm text-muted-foreground">
                Primeras 500 familias: acceso anticipado + contenido exclusivo + beneficios especiales cuando lancemos el marketplace.
              </p>
            </div>
          </div>
          
          {/* Hero illustration */}
          <div className="mt-12 flex justify-center md:mt-16">
            <div className="relative">
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-avatar shadow-lg md:h-64 md:w-64">
                <div className="animate-bounce-gentle text-8xl md:text-9xl">🐱</div>
              </div>
              <div className="absolute -right-8 top-0 animate-float text-4xl md:text-5xl">🐕</div>
              <div className="absolute -left-4 bottom-4 animate-float text-3xl delay-500 md:text-4xl" style={{ animationDelay: '0.5s' }}>❤️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section id="signup-form" className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Únete a la comunidad Kusi Pet
              </h2>
              <p className="text-muted-foreground">
                Déjanos tus datos para recibir tips, historias, alertas de mascotas perdidas y ser de los primeros en probar el ecosistema.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
              <CommunitySignupForm />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              En 3 simples pasos serás parte de nuestro ecosistema de cuidado para mascotas.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/30">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              ¿Por qué Kusi Pet?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Una comunidad con propósito para el bienestar de tu mascota.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Purpose Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Más que un marketplace: una comunidad con propósito
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {communityPurpose.map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 text-5xl">{item.emoji}</div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            ¿Listo para unirte a la comunidad Kusi Pet?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/90">
            Regístrate gratis y empieza a recibir contenido útil, historias reales y alertas importantes para el bienestar de tu mascota. Muy pronto tendrás acceso anticipado a nuestro marketplace y app pet-tech.
          </p>
          <Button 
            variant="coral" 
            size="xl"
            onClick={scrollToForm}
          >
            Unirme a la comunidad
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </Layout>
  );
}