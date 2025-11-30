import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  PawPrint, 
  Clock, 
  Bell, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Heart,
  ShoppingBag
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Registras a tu mascota',
    description: 'Crea un perfil con toda la información importante de tu compañero.',
    icon: PawPrint,
  },
  {
    number: '02',
    title: 'Personalizas su avatar digital',
    description: 'Tu mascota cobra vida en un avatar inteligente que te acompaña.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Recibes recomendaciones',
    description: 'Haces pedidos y sigues tus entregas de forma fácil.',
    icon: Heart,
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Ahorro de tiempo',
    description: 'Compra todo lo que tu mascota necesita en un solo lugar.',
  },
  {
    icon: Bell,
    title: 'Recordatorios importantes',
    description: 'Vacunas, cumpleaños, momento de recompra. Nunca olvidas nada.',
  },
  {
    icon: CheckCircle,
    title: 'Productos de calidad',
    description: 'Seleccionamos los mejores productos para el bienestar de tu mascota.',
  },
];

const categories = [
  { name: 'Alimento', emoji: '🍖', slug: 'alimento' },
  { name: 'Juguetes', emoji: '🎾', slug: 'juguetes' },
  { name: 'Snacks y premios', emoji: '🦴', slug: 'snacks' },
  { name: 'Artículos de cuidado', emoji: '🛁', slug: 'articulos-de-cuidado' },
  { name: 'Arena para gato', emoji: '🐱', slug: 'arena-para-gato' },
];

export default function Index() {
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
              Descubre productos seleccionados, crea un avatar digital único para tu mascota 
              y recibe recomendaciones personalizadas.
            </p>
            
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/marketplace">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <ShoppingBag className="h-5 w-5" />
                  Explorar productos
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Crear cuenta gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Hero illustration placeholder */}
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

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              En 3 simples pasos tendrás un ecosistema completo para el cuidado de tu mascota.
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
              Beneficios
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Todo lo que necesitas para el cuidado de tu mascota en una sola plataforma.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
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
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Categorías destacadas
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Encuentra todo lo que tu mascota necesita organizado por categorías.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/marketplace?category=${category.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg"
              >
                <span className="mb-3 text-4xl transition-transform group-hover:scale-110">
                  {category.emoji}
                </span>
                <span className="text-center font-medium text-foreground">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/marketplace">
              <Button variant="outline" size="lg">
                Ver todos los productos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            ¿Listo para comenzar?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/90">
            Únete a Kusi Pet y descubre una nueva forma de cuidar a tu mascota.
            Regístrate gratis y comienza hoy.
          </p>
          <Link to="/auth?mode=signup">
            <Button variant="coral" size="xl">
              Crear cuenta gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
