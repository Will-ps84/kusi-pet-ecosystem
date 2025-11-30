import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    address: '',
    district: '',
    paymentMethod: 'efectivo' as PaymentMethod,
    notes: '',
  });

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar un pedido');
      navigate('/auth');
      return;
    }

    if (!checkoutData.address.trim()) {
      toast.error('Ingresa tu dirección de entrega');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_products_amount: cart.subtotal,
          delivery_fee: cart.deliveryFee,
          total_amount: cart.total,
          payment_method: checkoutData.paymentMethod,
          delivery_address: checkoutData.address,
          district: checkoutData.district || null,
          notes: checkoutData.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_total_igv: item.product.price_total_igv,
        subtotal: item.product.price_total_igv * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast.success('¡Pedido realizado con éxito!');
      navigate('/mis-pedidos');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Tu carrito está vacío</h1>
          <p className="mb-6 text-muted-foreground">
            Agrega productos para comenzar tu pedido
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
        <h1 className="mb-8 text-3xl font-bold text-foreground">Tu carrito</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  {/* Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">📦</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/producto/${item.product.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.product.price_total_igv)} c/u
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-lg border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-foreground">
                          {formatPrice(item.product.price_total_igv * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Resumen</h2>

              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    Delivery
                  </span>
                  <span className="text-foreground">{formatPrice(cart.deliveryFee)}</span>
                </div>
              </div>

              <div className="flex justify-between border-b border-border py-4">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(cart.total)}</span>
              </div>

              <p className="mb-4 text-xs text-muted-foreground">
                El precio de los productos incluye IGV. El costo de delivery es fijo de S/ 7.00.
              </p>

              {/* Checkout Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección de entrega *</Label>
                  <Input
                    id="address"
                    placeholder="Av. Ejemplo 123, Dpto 401"
                    value={checkoutData.address}
                    onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">Distrito</Label>
                  <Input
                    id="district"
                    placeholder="Miraflores"
                    value={checkoutData.district}
                    onChange={(e) => setCheckoutData({ ...checkoutData, district: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Método de pago</Label>
                  <Select
                    value={checkoutData.paymentMethod}
                    onValueChange={(v) => setCheckoutData({ ...checkoutData, paymentMethod: v as PaymentMethod })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instrucciones especiales..."
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Procesando...' : 'Confirmar pedido'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
