import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Pet, Product, VaccinationRecord, SPECIES_LABELS, SEX_LABELS, Category } from '@/lib/types';
import { Sparkles, Send, ShoppingCart, Calendar, Syringe, PawPrint, MessageCircle, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMainPetPhoto } from '@/hooks/useMainPetPhoto';
import { AssistantCart } from '@/components/avatar/AssistantCart';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'order-confirmation';
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderSummary {
  items: { name: string; quantity: number; subtotal: number }[];
  total_products_amount: number;
  delivery_fee: number;
  total_amount: number;
  estimated_delivery: string;
}

// Categories by species for smart recommendations
const CAT_CATEGORIES = ['Alimento', 'Snacks/Premios', 'Artículos de cuidado', 'Arena para gato'];
const DOG_CATEGORIES = ['Alimento', 'Juguetes', 'Snacks/Premios', 'Artículos de cuidado'];

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
      className="rounded-xl border border-border p-4 transition-colors"
      style={{ 
        background: mainPhoto.url 
          ? `linear-gradient(135deg, ${mainPhoto.accentColor}, ${mainPhoto.dominantColor}20)` 
          : 'var(--gradient-avatar, linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.2)))'
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-card shadow-md">
          {mainPhoto.url ? (
            <img src={mainPhoto.url} alt={pet.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              {getSpeciesEmoji(pet.species)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{pet.name}</h2>
          <p className="text-xs text-muted-foreground">
            {SPECIES_LABELS[pet.species]} {pet.breed && `• ${pet.breed}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {pet.age_years && (
          <div className="rounded-md bg-card/80 px-2 py-1.5">
            <span className="text-muted-foreground">Edad:</span>{' '}
            <span className="font-medium">{pet.age_years} años</span>
          </div>
        )}
        {pet.weight_kg && (
          <div className="rounded-md bg-card/80 px-2 py-1.5">
            <span className="text-muted-foreground">Peso:</span>{' '}
            <span className="font-medium">{pet.weight_kg} kg</span>
          </div>
        )}
      </div>

      {nextVac && nextVac.next_due_date && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-card/80 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Syringe className="h-3.5 w-3.5 text-primary" />
            <div className="text-xs">
              <p className="font-medium">{nextVac.vaccine_name}</p>
              <p className="text-muted-foreground">
                {format(parseISO(nextVac.next_due_date), "d MMM", { locale: es })}
              </p>
            </div>
          </div>
          {(() => {
            const status = getVaccinationStatus(nextVac.next_due_date);
            if (!status) return null;
            return (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Vet-style assistant helper functions
// TODO: These can be replaced with Lovable AI Gateway calls for more intelligent responses
function getVetTip(pet: Pet, topic: string): string {
  const species = pet.species;
  const age = pet.age_years || 0;
  
  // Basic care tips based on species and topic
  if (topic.includes('aliment') || topic.includes('comida') || topic.includes('comer')) {
    if (species === 'gato') {
      if (age < 1) return `Para gatitos como ${pet.name}, recomiendo alimento especial para cachorros con alto contenido proteico. Aliméntalo 3-4 veces al día en porciones pequeñas.`;
      if (age > 7) return `Los gatos mayores como ${pet.name} necesitan alimento senior con menos calorías y más nutrientes para articulaciones. Considera 2 comidas al día.`;
      return `Para ${pet.name}, asegúrate de darle alimento de alta calidad con proteína animal como ingrediente principal. Los gatos son carnívoros estrictos.`;
    } else {
      if (age < 1) return `Para cachorros como ${pet.name}, el alimento debe ser específico para su tamaño y edad. Aliméntalo 3 veces al día hasta el año.`;
      if (age > 7) return `Los perros senior como ${pet.name} necesitan alimento con menos calorías y más fibra. Considera agregar glucosamina para sus articulaciones.`;
      return `Para ${pet.name}, el alimento debe ser adecuado a su tamaño y nivel de actividad. Divide su ración diaria en 2 comidas.`;
    }
  }
  
  if (topic.includes('juego') || topic.includes('ejercicio') || topic.includes('actividad')) {
    if (species === 'gato') {
      return `Los gatos como ${pet.name} necesitan estimulación mental y física. Dedica 15-20 minutos diarios a juegos interactivos con varitas o pelotas.`;
    }
    return `${pet.name} necesita ejercicio diario según su tamaño y edad. Caminatas, juegos de buscar y tiempo de juego fortalecen el vínculo y su salud.`;
  }
  
  if (topic.includes('vacuna')) {
    return `Las vacunas son esenciales para ${pet.name}. Consulta con tu veterinario el calendario de vacunación apropiado para su edad y estilo de vida.`;
  }
  
  if (topic.includes('baño') || topic.includes('higiene') || topic.includes('limpie')) {
    if (species === 'gato') {
      return `Los gatos como ${pet.name} se acicalan solos, pero puedes cepillarlo semanalmente para reducir bolas de pelo. Mantén su arenero limpio diariamente.`;
    }
    return `Baña a ${pet.name} cada 4-6 semanas o cuando sea necesario. Cepíllalo regularmente y revisa sus oídos y uñas semanalmente.`;
  }
  
  return '';
}

export default function MyAvatar() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Assistant cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastDeliveryInfo, setLastDeliveryInfo] = useState<{ address: string; district: string; telefono: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchPets();
      fetchLastDeliveryInfo();
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

  const fetchLastDeliveryInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('delivery_address, district, telefono')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLastDeliveryInfo({
          address: data.delivery_address,
          district: data.district || '',
          telefono: data.telefono || '',
        });
      }
    } catch (error) {
      console.error('Error fetching delivery info:', error);
    }
  };

  const selectPet = async (pet: Pet) => {
    setSelectedPet(pet);
    setMessages([
      {
        role: 'assistant',
        content: `¡Hola! Soy el Asistente Kusi Vet de ${pet.name} 🐾\n\nPuedo ayudarte con:\n• Recomendaciones de productos\n• Consejos de cuidado básico\n• Recordatorios de vacunas\n• Crear pedidos directamente\n\n¿En qué puedo ayudarte hoy?`,
      },
    ]);

    const { data: vacData } = await supabase
      .from('vaccination_records')
      .select('*')
      .eq('pet_id', pet.id)
      .order('next_due_date', { ascending: true });

    if (vacData) setVaccinations(vacData as VaccinationRecord[]);
    fetchRecommendations(pet);
  };

  const fetchRecommendations = async (pet: Pet) => {
    try {
      // First fetch categories to filter by name
      const { data: catData } = await supabase
        .from('categories')
        .select('*');
      
      if (catData) setCategories(catData as Category[]);

      // Get relevant category IDs based on species
      const relevantCategoryNames = pet.species === 'gato' ? CAT_CATEGORIES : DOG_CATEGORIES;
      const relevantCategoryIds = catData
        ?.filter(c => relevantCategoryNames.some(name => c.name.toLowerCase().includes(name.toLowerCase())))
        .map(c => c.id) || [];

      // Fetch products matching species and categories
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .or(`species_target.eq.${pet.species},species_target.eq.ambos`);

      if (relevantCategoryIds.length > 0) {
        query = query.in('category_id', relevantCategoryIds);
      }

      const { data, error } = await query.limit(12);

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

    // TODO: Replace this rule-based logic with Lovable AI Gateway for smarter responses
    // Example: await supabase.functions.invoke('avatar-chat', { body: { messages, pet: selectedPet } })
    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();

      // Check for vet tips first
      const vetTip = getVetTip(selectedPet, lowerMessage);
      
      if (lowerMessage.includes('vacuna') || lowerMessage.includes('vacunación')) {
        if (vaccinations.length > 0) {
          const nextVac = vaccinations.find((v) => v.next_due_date);
          if (nextVac) {
            response = `La próxima vacuna de ${selectedPet.name} es "${nextVac.vaccine_name}" programada para ${format(parseISO(nextVac.next_due_date!), "d 'de' MMMM", { locale: es })}.\n\n${vetTip || 'Te recomiendo agendar una cita con el veterinario pronto.'}`;
          } else {
            response = `${selectedPet.name} tiene ${vaccinations.length} vacuna(s) registrada(s). No hay próximas vacunas programadas.`;
          }
        } else {
          response = `No tienes vacunas registradas para ${selectedPet.name}. Te recomiendo llevar un registro de sus vacunas para un mejor cuidado.`;
        }
      } else if (vetTip) {
        response = vetTip;
      } else if (lowerMessage.includes('producto') || lowerMessage.includes('recomienda') || lowerMessage.includes('comprar')) {
        response = `He seleccionado productos ideales para ${selectedPet.name} basándome en su especie y necesidades. ¡Puedes agregarlos directamente a tu pedido desde las tarjetas de abajo!`;
      } else if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') || lowerMessage.includes('carrito')) {
        if (cartItems.length > 0) {
          response = `Tienes ${cartItems.length} producto(s) en tu pedido. Puedes confirmar tu pedido desde el panel de carrito.`;
        } else {
          response = `Aún no tienes productos en tu pedido. Agrega productos desde las recomendaciones y yo te ayudo a completar la compra.`;
        }
      } else if (lowerMessage.includes('cumpleaños') || lowerMessage.includes('edad')) {
        if (selectedPet.birthday) {
          response = `¡El cumpleaños de ${selectedPet.name} es el ${format(parseISO(selectedPet.birthday), "d 'de' MMMM", { locale: es })}! 🎂`;
        } else {
          response = `No tengo registrado el cumpleaños de ${selectedPet.name}. Puedes agregarlo en "Mis mascotas".`;
        }
      } else {
        response = `Gracias por tu mensaje. Como Asistente Kusi Vet de ${selectedPet.name}, puedo ayudarte con:\n\n• Recomendaciones de productos\n• Consejos de alimentación y cuidado\n• Información sobre vacunas\n• Crear pedidos\n\n¿En qué te puedo ayudar?`;
      }

      // Add disclaimer for health-related topics
      if (lowerMessage.includes('enferm') || lowerMessage.includes('síntoma') || lowerMessage.includes('dolor') || lowerMessage.includes('salud') || lowerMessage.includes('médic')) {
        response += '\n\n⚠️ *Este asistente no reemplaza a un veterinario. Ante síntomas graves o dudas de salud, visita siempre a un profesional.*';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    toast.success(`${product.name} agregado al pedido`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleOrderConfirmed = (orderSummary: OrderSummary) => {
    // Add confirmation message to chat
    const itemsList = orderSummary.items.map(i => `• ${i.name} x${i.quantity}: S/ ${i.subtotal.toFixed(2)}`).join('\n');
    const confirmationMessage = `✅ ¡Pedido confirmado!\n\n${itemsList}\n\nSubtotal: S/ ${orderSummary.total_products_amount.toFixed(2)}\nDelivery: S/ ${orderSummary.delivery_fee.toFixed(2)}\n**Total: S/ ${orderSummary.total_amount.toFixed(2)}**\n\n📦 Entrega estimada: ${orderSummary.estimated_delivery}\n\nPuedes ver tu pedido en "Mis pedidos".`;
    
    setMessages(prev => [...prev, { role: 'assistant', content: confirmationMessage }]);
    
    // Refresh delivery info for next order
    fetchLastDeliveryInfo();
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
      <div className="container py-4 pb-24 lg:py-6 lg:pb-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-avatar">
            <Sparkles className="h-5 w-5 text-lavender-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground lg:text-2xl">Asistente Kusi Vet</h1>
            <p className="text-xs text-muted-foreground">Tu compañero inteligente para el cuidado de mascotas</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_280px]">
          {/* Left Column: Pet Selection */}
          <div className="space-y-3 lg:order-1">
            {/* Pet Selector */}
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Mascota</p>
              <div className="flex flex-wrap gap-1.5">
                {pets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant={selectedPet?.id === pet.id ? 'hero' : 'outline'}
                    size="sm"
                    onClick={() => selectPet(pet)}
                    className="gap-1 text-xs h-8"
                  >
                    <span>{getSpeciesEmoji(pet.species)}</span>
                    <span>{pet.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Pet Card */}
            {selectedPet && (
              <PetAvatarCard 
                pet={selectedPet} 
                vaccinations={vaccinations} 
                getVaccinationStatus={getVaccinationStatus} 
              />
            )}

            {/* Disclaimer */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning" />
                <p>Este asistente ofrece orientación general. No reemplaza la consulta con un veterinario profesional.</p>
              </div>
            </div>
          </div>

          {/* Center: Chat & Recommendations */}
          <div className="space-y-4 lg:order-2">
            {/* Chat Panel */}
            <div className="flex h-[300px] flex-col rounded-xl border border-border bg-card lg:h-[360px]">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Chat con {selectedPet?.name}
                  </h3>
                </div>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
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

              <div className="border-t border-border p-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Pregunta sobre cuidados, productos..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button variant="hero" size="icon" onClick={handleSendMessage} className="h-9 w-9">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Recomendados para {selectedPet?.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {recommendations.slice(0, 6).map((product) => (
                    <ProductRecommendationCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Cart (Desktop only) */}
          <div className="lg:order-3">
            <AssistantCart
              items={cartItems}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onOrderConfirmed={handleOrderConfirmed}
              lastDeliveryInfo={lastDeliveryInfo}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Product recommendation card with quantity selector
function ProductRecommendationCard({ 
  product, 
  onAddToCart 
}: { 
  product: Product; 
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  return (
    <div className="rounded-lg border border-border bg-card p-2 transition-all hover:border-primary/50">
      <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">📦</div>
        )}
      </div>
      <p className="line-clamp-2 text-xs font-medium text-foreground mb-1">{product.name}</p>
      <p className="text-sm font-bold text-primary mb-2">{formatPrice(product.price_total_igv)}</p>
      
      {/* Quantity selector */}
      <div className="flex items-center gap-1 mb-2">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-xs font-medium">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          disabled={quantity >= product.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button
        variant="hero"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={() => {
          onAddToCart(product, quantity);
          setQuantity(1);
        }}
        disabled={product.stock < 1}
      >
        <ShoppingCart className="mr-1 h-3 w-3" />
        Agregar
      </Button>
    </div>
  );
}
