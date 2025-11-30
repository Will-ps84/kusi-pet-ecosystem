import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { Package, ChevronRight, Clock, MapPin, CreditCard } from 'lucide-react';
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

export default function MyOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
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
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as unknown as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Sin pedidos aún</h1>
          <p className="mb-6 text-muted-foreground">
            Cuando realices tu primer pedido, aparecerá aquí
          </p>
          <Link to="/marketplace">
            <Button variant="hero">Explorar productos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Mis pedidos</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {order.district || order.delivery_address.slice(0, 30)}...
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(order.total_amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.items?.length || 0} producto(s)
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {order.items.slice(0, 4).map((item: any) => (
                    <div
                      key={item.id}
                      className="h-16 w-16 overflow-hidden rounded-lg bg-muted"
                    >
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              )}

              <Link to={`/pedido/${order.id}`}>
                <Button variant="ghost" className="mt-4 w-full">
                  Ver detalles
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
