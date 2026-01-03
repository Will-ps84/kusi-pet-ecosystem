import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Check, Truck, MapPin, Phone, AlertCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingOrder {
  id: string;
  status: string | null;
  district: string | null;
  delivery_address: string;
  delivery_window: string | null;
  created_at: string | null;
}

const ORDER_STEPS = [
  { key: 'recibido', label: 'Recibido', icon: Package, description: 'Tu pedido fue recibido' },
  { key: 'confirmado', label: 'Confirmado', icon: Check, description: 'Pedido confirmado' },
  { key: 'preparando', label: 'Preparando', icon: Package, description: 'Preparando tu pedido' },
  { key: 'en_ruta', label: 'En ruta', icon: Truck, description: 'Tu pedido va en camino' },
  { key: 'entregado', label: 'Entregado', icon: MapPin, description: '¡Pedido entregado!' },
];

const WHATSAPP_NUMBER = '51997227638';

export default function Tracking() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchOrder(token);
    }
  }, [token]);

  const fetchOrder = async (trackingToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the secure RPC function that only returns limited fields
      const { data, error: fetchError } = await supabase
        .rpc('get_order_by_tracking_token', { p_tracking_token: trackingToken });

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        setError('error');
        return;
      }

      // RPC returns an array, get first result
      if (!data || data.length === 0) {
        setError('not_found');
        return;
      }

      setOrder(data[0]);
    } catch (err) {
      console.error('Error:', err);
      setError('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order?.status) return 0;
    if (order.status === 'cancelado') return -1;
    const index = ORDER_STEPS.findIndex((step) => step.key === order.status);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order?.status === 'cancelado';

  // Mask address for privacy - show only district
  const getMaskedAddress = () => {
    if (order?.district) {
      return order.district;
    }
    // Extract district-like info from address if no separate district
    const address = order?.delivery_address || '';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'Lima';
  };

  const getWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Hola Kusi Pet! Tengo una consulta sobre mi pedido.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container max-w-lg py-12">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">
                  {error === 'not_found' 
                    ? 'Pedido no encontrado' 
                    : 'Error al cargar el pedido'}
                </h2>
                <p className="text-muted-foreground">
                  {error === 'not_found'
                    ? 'El enlace de seguimiento no es válido o ha expirado.'
                    : 'Hubo un problema al cargar la información del pedido.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ir al inicio
                  </Link>
                </Button>
                <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                    <Phone className="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8 px-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2">
              <span className="text-4xl">🐾</span>
            </div>
            <CardTitle className="text-2xl">Seguimiento de Pedido</CardTitle>
            <p className="text-sm text-muted-foreground">Kusi Pet</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Status Message */}
            {isCancelled ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <p className="text-destructive font-medium">
                  Este pedido ha sido cancelado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Si tienes dudas, contáctanos por WhatsApp
                </p>
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-primary font-medium text-lg">
                  {ORDER_STEPS[currentStepIndex]?.description || 'Procesando tu pedido'}
                </p>
                {order.delivery_window && order.status === 'en_ruta' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ⏰ Estimamos la entrega: <strong>{order.delivery_window}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Progress Steps */}
            {!isCancelled && (
              <div className="py-4">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
                  <div 
                    className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
                    style={{ 
                      height: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` 
                    }}
                  />

                  {/* Steps */}
                  <div className="space-y-6 relative">
                    {ORDER_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="flex items-center gap-4">
                          <div
                            className={cn(
                              "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                              isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-background text-muted-foreground"
                            )}
                          >
                            <StepIcon className={cn("h-5 w-5", isCurrent && "animate-pulse")} />
                          </div>
                          <div className="flex-1">
                            <p
                              className={cn(
                                "font-medium transition-colors",
                                isCompleted ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          {isCompleted && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Delivery Info */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Información de entrega
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zona de entrega:</span>
                  <span className="font-medium">{getMaskedAddress()}</span>
                </div>
                {order.delivery_window && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ventana de entrega:</span>
                    <span className="font-medium">{order.delivery_window}</span>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="pt-2">
              <Button
                asChild
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                size="lg"
              >
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-2 h-5 w-5" />
                  ¿Tienes dudas? Escríbenos por WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 Kusi Pet - Lima, Perú
        </p>
      </div>
    </Layout>
  );
}
