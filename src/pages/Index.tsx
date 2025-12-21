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
  ArrowRight,
  CheckCircle,
  Mail,
  MessageCircle
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Crea el perfil de tu mascota',
    description: 'Registra a tu perro o gato con su edad, peso y necesidades. Así empezamos a conocerlo.',
    icon: PawPrint,
  },
  {
    number: '02',
    title: 'Conéctate con la comunidad',
    description: 'Recibe contenido útil, historias reales y alertas de mascotas perdidas en Lima.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Recibe recomendaciones personalizadas',
    description: 'Muy pronto: IA que te ayudará con planes de cuidado según la edad, raza y estilo de vida de tu mascota.',
    icon: Sparkles,
  },
];

const benefits = [
  {
    icon: CheckCircle,
    title: 'Recordatorios de vacunas',
    bullets: [
      'Alertas antes de cada dosis',
      'Historial de vacunación',
      'Calendario veterinario'
    ],
  },
  {
    icon: Brain,
    title: 'Recomendaciones de IA',
    bullets: [
      'Planes según edad y raza',
      'Tips para el clima de Lima',
      'Consejos de alimentación'
    ],
  },
  {
    icon: Search,
    title: 'Mascotas perdidas',
    bullets: [
      'Alertas en tu zona',
      'Difusión rápida',
      'Red de apoyo local'
    ],
  },
  {
    icon: HandHeart,
    title: 'Adopciones responsables',
    bullets: [
      'Perfiles de mascotas',
      'Conexión con albergues',
      'Guías de adopción'
    ],
  },
];

const communityPurpose = [
  {
    icon: Search,
    title: 'Mascotas perdidas',
    description: 'Alertas en tu zona de Lima para ayudar a que vuelvan a casa.',
    emoji: '🔍',
  },
  {
    icon: Heart,
    title: 'Adopciones responsables',
    description: 'Conectamos familias con mascotas que buscan un hogar.',
    emoji: '❤️',
  },
  {
    icon: Home,
    title: 'Apoyo a albergues',
    description: 'Visibilidad y donaciones para refugios locales.',
    emoji: '🏠',
  },
];

const WHATSAPP_NUMBER = '51997227638';
const WHATSAPP_MESSAGE = 'Hola, quiero saber más sobre Kusi Pet';

export default function Index() {
  const scrollToForm = () => {
    document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-light/50 to-background pb-20 pt-16 md:pb-32 md:pt-24">
        {/* Decorative elements */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-10 top-40 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <PawPrint className="h-4 w-4" />
              <span>Comunidad pet-tech en Lima</span>
            </div>
            
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-foreground md:mb-6 md:text-5xl lg:text-6xl">
              La comunidad para familias con{' '}
              <span className="text-gradient-primary">perros y gatos</span>{' '}
              en Lima
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-xl">
              Kusi Pet es una comunidad gratuita que te acompaña en el cuidado de tu mascota con contenido útil, alertas de mascotas perdidas, adopciones y recomendaciones personalizadas.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full sm:w-auto"
                onClick={scrollToForm}
              >
                <Heart className="h-5 w-5" />
                Unirme a la comunidad Kusi Pet
              </Button>
              
              <p className="max-w-md text-sm text-muted-foreground">
                100% gratis · Enfocado en Lima · Contenido curado por expertos
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
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center px-2">
              <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Únete a la comunidad Kusi Pet
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Déjanos tus datos para recibir tips de cuidado, historias reales y alertas de mascotas perdidas en Lima.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 md:p-8">
              <CommunitySignupForm />
            </div>
          </div>
        </div>
      </section>

      {/* About Kusi Pet */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <PawPrint className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  Sobre Kusi Pet
                </h3>
                <p className="text-muted-foreground">
                  Somos un equipo en Lima apasionado por el bienestar animal. Creamos Kusi Pet para conectar a familias pet-parents con contenido útil, apoyo local y una comunidad que entiende lo que significa cuidar a un perrhijo o gathijo. No somos una tienda anónima: somos pet-parents como tú.
                </p>
              </div>
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
              En 3 simples pasos serás parte de nuestra comunidad de cuidado para mascotas.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg md:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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

      {/* Benefits with bullets */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              ¿Por qué Kusi Pet?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Beneficios concretos para ti y tu mascota.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col rounded-2xl bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <ul className="space-y-2">
                  {benefit.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* AI Clarification */}
          <div className="mt-12 mx-auto max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h4 className="mb-2 font-semibold text-foreground">¿Cómo funciona la IA de Kusi Pet?</h4>
            <p className="text-sm text-muted-foreground">
              Muy pronto podrás recibir planes de cuidado personalizados según la edad, raza y estilo de vida de tu mascota. Consideramos el contexto de Lima (clima, servicios locales) para darte recomendaciones útiles y prácticas.
            </p>
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
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Por ahora estamos enfocados en construir comunidad. El marketplace llegará pronto.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {communityPurpose.map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg md:p-8"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center text-5xl">
                  {item.emoji}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="mb-4 text-2xl font-bold text-foreground">
              ¿Tienes dudas? Escríbenos
            </h3>
            <p className="mb-6 text-muted-foreground">
              Estamos aquí para ayudarte con cualquier pregunta sobre Kusi Pet.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                Hablar por WhatsApp
              </a>
              <a
                href="mailto:hola@kusipet.com"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition-all hover:border-primary/50 hover:shadow-md"
              >
                <Mail className="h-5 w-5" />
                hola@kusipet.com
              </a>
            </div>
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
            Regístrate gratis y empieza a recibir contenido útil, historias reales y alertas importantes para el bienestar de tu mascota.
          </p>
          <Button 
            variant="coral" 
            size="xl"
            onClick={scrollToForm}
          >
            Unirme a la comunidad Kusi Pet
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </Layout>
  );
}
