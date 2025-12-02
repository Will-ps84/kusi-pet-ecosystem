import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Pet, Product, VaccinationRecord, SPECIES_LABELS, SEX_LABELS } from '@/lib/types';
import { Sparkles, Send, ShoppingCart, Calendar, Syringe, PawPrint, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMainPetPhoto } from '@/hooks/useMainPetPhoto';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Pet Avatar Card with photo integration
function PetAvatarCard({ 
  pet, 
  vaccinations,
  getVaccinationStatus 
}: { 
  pet: Pet; 
  vaccinations: VaccinationRecord[];
  getVaccinationStatus: (date: string | null) => { label: string; className: string } | null;
}) {
  const { mainPhoto } = useMainPetPhoto(pet.id);
  const nextVac = vaccinations.find(v => v.next_due_date && !isPast(parseISO(v.next_due_date)));

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      default: return '🐾';
    }
  };

  return (
    <div 
      className="rounded-xl border border-border p-5 transition-colors"
      style={{ 
        background: mainPhoto.url 
          ? `linear-gradient(135deg, ${mainPhoto.accentColor}, ${mainPhoto.dominantColor}20)` 
          : 'var(--gradient-avatar, linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.2)))'
      }}
    >
      <div className="mb-4 flex items-center gap-4">
        {/* Pet Photo or Emoji */}
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-card shadow-md lg:h-20 lg:w-20">
          {mainPhoto.url ? (
            <img
              src={mainPhoto.url}
              alt={pet.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl lg:text-5xl">
              {getSpeciesEmoji(pet.species)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground lg:text-2xl">{pet.name}</h2>
          <p className="text-sm text-muted-foreground">
            {SPECIES_LABELS[pet.species]} {pet.breed && `• ${pet.breed}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {pet.sex && (
          <div className="rounded-lg bg-card/80 px-3 py-2">
            <span className="text-muted-foreground">Sexo:</span>{' '}
            <span className="font-medium">{SEX_LABELS[pet.sex]}</span>
          </div>
        )}
        {pet.age_years && (
          <div className="rounded-lg bg-card/80 px-3 py-2">
            <span className="text-muted-foreground">Edad:</span>{' '}
            <span className="font-medium">{pet.age_years} años</span>
          </div>
        )}
        {pet.color && (
          <div className="rounded-lg bg-card/80 px-3 py-2">
            <span className="text-muted-foreground">Color:</span>{' '}
            <span className="font-medium">{pet.color}</span>
          </div>
        )}
        {pet.weight_kg && (
          <div className="rounded-lg bg-card/80 px-3 py-2">
            <span className="text-muted-foreground">Peso:</span>{' '}
            <span className="font-medium">{pet.weight_kg} kg</span>
          </div>
        )}
      </div>

      {pet.birthday && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-card/80 px-3 py-2">
          <Calendar className="h-4 w-4 text-accent" />
          <span className="text-sm">
            Cumpleaños: {format(parseISO(pet.birthday), "d 'de' MMMM", { locale: es })}
          </span>
        </div>
      )}

      {nextVac && nextVac.next_due_date && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-card/80 px-3 py-2">
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{nextVac.vaccine_name}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(nextVac.next_due_date), "d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
          {(() => {
            const status = getVaccinationStatus(nextVac.next_due_date);
            if (!status) return null;
            return (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function MyAvatar() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchPets();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data as Pet[]);
      if (data.length > 0) {
        selectPet(data[0] as Pet);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPet = async (pet: Pet) => {
    setSelectedPet(pet);
    setMessages([
      {
        role: 'assistant',
        content: `¡Hola! Soy el asistente de ${pet.name}. ¿En qué puedo ayudarte hoy? Puedo darte recomendaciones de productos, recordarte sobre vacunas o responder tus preguntas.`,
      },
    ]);

    const { data: vacData } = await supabase
      .from('vaccination_records')
      .select('*')
      .eq('pet_id', pet.id)
      .order('next_due_date', { ascending: true });

    if (vacData) setVaccinations(vacData as VaccinationRecord[]);
    fetchRecommendations(pet.species);
  };

  const fetchRecommendations = async (species: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .or(`species_target.eq.${species},species_target.eq.ambos`)
        .limit(8);

      if (error) throw error;
      setRecommendations(data as unknown as Product[]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedPet) return;

    const userMessage = inputMessage.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');

    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('vacuna') || lowerMessage.includes('vacunación')) {
        if (vaccinations.length > 0) {
          const nextVac = vaccinations.find((v) => v.next_due_date);
          if (nextVac) {
            response = `La próxima vacuna de ${selectedPet.name} es "${nextVac.vaccine_name}" programada para ${format(parseISO(nextVac.next_due_date!), "d 'de' MMMM", { locale: es })}. Te recomiendo agendar una cita con el veterinario pronto.`;
          } else {
            response = `${selectedPet.name} tiene ${vaccinations.length} vacuna(s) registrada(s). No hay próximas vacunas programadas.`;
          }
        } else {
          response = `No tienes vacunas registradas para ${selectedPet.name}. Te recomiendo llevar un registro de sus vacunas para un mejor cuidado.`;
        }
      } else if (lowerMessage.includes('comida') || lowerMessage.includes('alimento') || lowerMessage.includes('comer')) {
        response = `Para ${selectedPet.name}, un ${SPECIES_LABELS[selectedPet.species].toLowerCase()} de ${selectedPet.age_years || 'edad desconocida'} años, te recomiendo un alimento de alta calidad. ¿Te gustaría ver nuestras opciones de alimentos?`;
      } else if (lowerMessage.includes('producto') || lowerMessage.includes('recomienda')) {
        response = `Basándome en las necesidades de ${selectedPet.name}, he preparado algunas recomendaciones que puedes ver abajo. ¡Son productos ideales para ${SPECIES_LABELS[selectedPet.species].toLowerCase()}s!`;
      } else if (lowerMessage.includes('cumpleaños') || lowerMessage.includes('edad')) {
        if (selectedPet.birthday) {
          response = `¡El cumpleaños de ${selectedPet.name} es el ${format(parseISO(selectedPet.birthday), "d 'de' MMMM", { locale: es })}! 🎂`;
        } else {
          response = `No tengo registrado el cumpleaños de ${selectedPet.name}. Puedes agregarlo en la sección "Mis mascotas".`;
        }
      } else {
        response = `Gracias por tu mensaje. Como asistente de ${selectedPet.name}, puedo ayudarte con recomendaciones de productos, información sobre vacunas y recordatorios importantes. ¿En qué más puedo ayudarte?`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      default: return '🐾';
    }
  };

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  const getVaccinationStatus = (nextDueDate: string | null) => {
    if (!nextDueDate) return null;

    const dueDate = parseISO(nextDueDate);
    const today = new Date();
    const soonThreshold = addDays(today, 30);

    if (isPast(dueDate)) {
      return { label: 'Vencida', className: 'bg-destructive/10 text-destructive' };
    }
    if (isWithinInterval(dueDate, { start: today, end: soonThreshold })) {
      return { label: 'Próxima', className: 'bg-warning/10 text-warning' };
    }
    return { label: 'Al día', className: 'bg-success/10 text-success' };
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (pets.length === 0) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-avatar">
            <PawPrint className="h-12 w-12 text-lavender-dark" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Aún no tienes mascotas</h1>
          <p className="mb-6 text-muted-foreground">
            Registra a tu primera mascota para activar su avatar digital
          </p>
          <Link to="/mis-mascotas">
            <Button variant="hero">Registrar mascota</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-avatar">
            <Sparkles className="h-6 w-6 text-lavender-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Mi Avatar</h1>
            <p className="text-sm text-muted-foreground">Asistente digital para tu mascota</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Pet Selector */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Selecciona mascota</p>
              <div className="flex flex-wrap gap-2">
                {pets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant={selectedPet?.id === pet.id ? 'hero' : 'outline'}
                    size="sm"
                    onClick={() => selectPet(pet)}
                    className="gap-1"
                  >
                    <span>{getSpeciesEmoji(pet.species)}</span>
                    <span>{pet.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Pet Avatar Card with Photo */}
            {selectedPet && (
              <PetAvatarCard 
                pet={selectedPet} 
                vaccinations={vaccinations} 
                getVaccinationStatus={getVaccinationStatus} 
              />
            )}
          </div>

          {/* Right Column: Chat & Recommendations */}
          <div className="space-y-6">
            {/* Chat Panel */}
            <div className="flex h-[400px] flex-col rounded-xl border border-border bg-card lg:h-[480px]">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Asistente de {selectedPet?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pregúntame sobre productos, vacunas o cuidados
                  </p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'rounded-br-md bg-primary text-primary-foreground'
                            : 'rounded-bl-md bg-muted text-foreground'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-border p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe tu mensaje..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="hero" size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  Recomendaciones para {selectedPet?.name}
                </h3>
                <div className="relative -mx-4 px-4 lg:mx-0 lg:px-0">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                    {recommendations.map((product) => (
                      <div
                        key={product.id}
                        className="w-[140px] shrink-0 snap-start rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 lg:w-[160px]"
                      >
                        <div className="mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-3xl">📦</div>
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs font-medium text-foreground lg:text-sm">
                          {product.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-primary lg:text-sm">
                            {formatPrice(product.price_total_igv)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
