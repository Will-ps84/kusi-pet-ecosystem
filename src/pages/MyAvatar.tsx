import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Pet, Product, SPECIES_LABELS, SEX_LABELS } from '@/lib/types';
import { Sparkles, Send, ShoppingCart, Calendar, Syringe, PawPrint } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MyAvatar() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
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

    // Fetch vaccinations
    const { data: vacData } = await supabase
      .from('vaccination_records')
      .select('*')
      .eq('pet_id', pet.id)
      .order('next_due_date', { ascending: true });

    if (vacData) setVaccinations(vacData);

    // Fetch recommendations based on species
    fetchRecommendations(pet.species);
  };

  const fetchRecommendations = async (species: string) => {
    try {
      // Simple rule-based recommendations
      const categories = species === 'gato'
        ? ['Alimento', 'Snacks', 'Premios', 'Artículos de cuidado', 'Arena para gato']
        : ['Alimento', 'Juguetes', 'Snacks', 'Premios', 'Artículos de cuidado'];

      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .or(`species_target.eq.${species},species_target.eq.ambos`)
        .limit(6);

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

    // Simple rule-based responses (placeholder for future LLM integration)
    // TODO: Integrate with Lovable AI Gateway here
    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('vacuna') || lowerMessage.includes('vacunación')) {
        if (vaccinations.length > 0) {
          const nextVac = vaccinations.find((v) => v.next_due_date);
          if (nextVac) {
            response = `La próxima vacuna de ${selectedPet.name} es "${nextVac.vaccine_name}" programada para ${format(new Date(nextVac.next_due_date), "d 'de' MMMM", { locale: es })}. Te recomiendo agendar una cita con el veterinario pronto.`;
          } else {
            response = `${selectedPet.name} tiene ${vaccinations.length} vacuna(s) registrada(s). No hay próximas vacunas programadas.`;
          }
        } else {
          response = `No tienes vacunas registradas para ${selectedPet.name}. Te recomiendo llevar un registro de sus vacunas para un mejor cuidado.`;
        }
      } else if (lowerMessage.includes('comida') || lowerMessage.includes('alimento') || lowerMessage.includes('comer')) {
        response = `Para ${selectedPet.name}, un ${SPECIES_LABELS[selectedPet.species].toLowerCase()} de ${selectedPet.age_years || 'edad desconocida'} años, te recomiendo un alimento de alta calidad. ¿Te gustaría ver nuestras opciones de alimentos?`;
      } else if (lowerMessage.includes('producto') || lowerMessage.includes('recomienda')) {
        response = `Basándome en las necesidades de ${selectedPet.name}, he preparado algunas recomendaciones que puedes ver en la sección "Recomendaciones para hoy". ¡Son productos ideales para ${SPECIES_LABELS[selectedPet.species].toLowerCase()}s!`;
      } else if (lowerMessage.includes('cumpleaños') || lowerMessage.includes('edad')) {
        if (selectedPet.birthday) {
          response = `¡El cumpleaños de ${selectedPet.name} es el ${format(new Date(selectedPet.birthday), "d 'de' MMMM", { locale: es })}! 🎂`;
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
      <div className="container py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-avatar">
            <Sparkles className="h-6 w-6 text-lavender-dark" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Avatar</h1>
            <p className="text-muted-foreground">Asistente digital para tu mascota</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Pet Selection & Info */}
          <div className="space-y-6">
            {/* Pet Selector */}
            <div className="rounded-xl border border-border bg-card p-4">
              <Label className="mb-3 block text-sm font-medium">Selecciona mascota</Label>
              <div className="flex flex-wrap gap-2">
                {pets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant={selectedPet?.id === pet.id ? 'hero' : 'outline'}
                    size="sm"
                    onClick={() => selectPet(pet)}
                  >
                    {getSpeciesEmoji(pet.species)} {pet.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pet Card */}
            {selectedPet && (
              <div className="rounded-xl border border-border bg-gradient-avatar p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card text-5xl shadow-md">
                    {getSpeciesEmoji(selectedPet.species)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedPet.name}</h2>
                    <p className="text-muted-foreground">
                      {SPECIES_LABELS[selectedPet.species]} {selectedPet.breed && `• ${selectedPet.breed}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedPet.sex && (
                    <div className="rounded-lg bg-card/80 p-2">
                      <span className="text-muted-foreground">Sexo:</span>{' '}
                      <span className="font-medium">{SEX_LABELS[selectedPet.sex]}</span>
                    </div>
                  )}
                  {selectedPet.age_years && (
                    <div className="rounded-lg bg-card/80 p-2">
                      <span className="text-muted-foreground">Edad:</span>{' '}
                      <span className="font-medium">{selectedPet.age_years} años</span>
                    </div>
                  )}
                  {selectedPet.color && (
                    <div className="rounded-lg bg-card/80 p-2">
                      <span className="text-muted-foreground">Color:</span>{' '}
                      <span className="font-medium">{selectedPet.color}</span>
                    </div>
                  )}
                  {selectedPet.weight_kg && (
                    <div className="rounded-lg bg-card/80 p-2">
                      <span className="text-muted-foreground">Peso:</span>{' '}
                      <span className="font-medium">{selectedPet.weight_kg} kg</span>
                    </div>
                  )}
                </div>

                {selectedPet.birthday && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-card/80 p-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span className="text-sm">
                      Cumpleaños: {format(new Date(selectedPet.birthday), "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                )}

                {vaccinations.length > 0 && vaccinations[0].next_due_date && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-card/80 p-3">
                    <Syringe className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      Próxima vacuna: {format(new Date(vaccinations[0].next_due_date), "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="flex h-[600px] flex-col rounded-xl border border-border bg-card">
              {/* Chat Header */}
              <div className="border-b border-border p-4">
                <h3 className="font-semibold text-foreground">
                  Asistente de {selectedPet?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pregúntame sobre productos, vacunas o cuidados
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe tu mensaje..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button variant="hero" size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Recomendaciones para hoy
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {recommendations.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50"
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
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(product.price_total_igv)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
