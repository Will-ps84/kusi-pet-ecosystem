import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { ArrowLeft, MapPin, CreditCard, Clock, Package, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  recibido: 'bg-blue-100 text-blue-700',
  confirmado: 'bg-teal-100 text-teal-700',
  preparando: 'bg-yellow-100 text-yellow-700',
  en_ruta: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user && id) {
      fetchOrder();
    }
  }, [user, authLoading, id, navigate]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setOrder(data as unknown as Order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="mb-2 text-2xl font-bold">Pedido no encontrado</h1>
          <Link to="/mis-pedidos">
            <Button variant="hero">Ver mis pedidos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Link
          to="/mis-pedidos"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis pedidos
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">
                      {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pago</p>
                    <p className="text-sm font-medium">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="text-sm font-medium">{formatPrice(order.delivery_fee)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Dirección de entrega</h3>
              </div>
              <p className="text-muted-foreground">{order.delivery_address}</p>
              {order.district && (
                <p className="text-sm text-muted-foreground">{order.district}</p>
              )}
              {order.notes && (
                <p className="mt-2 text-sm italic text-muted-foreground">"{order.notes}"</p>
              )}
            </div>

            {/* Products */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Productos</h3>
              </div>

              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unit_price_total_igv)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-foreground">Resumen</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(order.total_products_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">{formatPrice(order.delivery_fee)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                El precio de los productos incluye IGV.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
