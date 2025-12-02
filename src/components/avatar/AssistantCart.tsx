import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingBag, Trash2, ChevronUp, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/lib/types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface AssistantCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderConfirmed: (orderSummary: OrderSummary) => void;
  lastDeliveryInfo: { address: string; district: string } | null;
}

interface OrderSummary {
  items: { name: string; quantity: number; subtotal: number }[];
  total_products_amount: number;
  delivery_fee: number;
  total_amount: number;
  estimated_delivery: string;
}

const DELIVERY_FEE = 7.00;

export function AssistantCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderConfirmed,
  lastDeliveryInfo,
}: AssistantCartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    address: lastDeliveryInfo?.address || '',
    district: lastDeliveryInfo?.district || '',
    notes: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price_total_igv * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  const handleConfirmOrder = async () => {
    // If we have saved delivery info, use it directly
    if (lastDeliveryInfo) {
      await submitOrder(lastDeliveryInfo.address, lastDeliveryInfo.district, '');
    } else {
      // Show delivery form dialog
      setIsDeliveryDialogOpen(true);
    }
  };

  const submitOrder = async (address: string, district: string, notes: string) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Debes iniciar sesión para realizar un pedido');
        return;
      }

      const response = await supabase.functions.invoke('avatar-order', {
        body: {
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price_total_igv,
          })),
          delivery_address: address,
          district: district,
          notes: notes,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al crear el pedido');
      }

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Error al crear el pedido');
      }

      toast.success('¡Pedido creado exitosamente!');
      setIsDeliveryDialogOpen(false);
      onClearCart();
      onOrderConfirmed(data.order);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryForm.address.trim()) {
      toast.error('La dirección es requerida');
      return;
    }
    submitOrder(deliveryForm.address, deliveryForm.district, deliveryForm.notes);
  };

  if (items.length === 0) {
    return null;
  }

  // Mobile: Bottom sheet
  const MobileCart = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div 
        className={`bg-card border-t border-border shadow-lg transition-all duration-300 ${
          isExpanded ? 'max-h-[70vh]' : 'max-h-16'
        }`}
      >
        {/* Toggle bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="font-medium">{items.length} producto(s)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary">{formatPrice(total)}</span>
            <ChevronUp className={`h-5 w-5 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
          </div>
        </button>

        {/* Cart content */}
        {isExpanded && (
          <div className="max-h-[calc(70vh-4rem)] overflow-y-auto px-4 pb-4">
            <CartContent />
          </div>
        )}
      </div>
    </div>
  );

  // Desktop: Side panel
  const DesktopCart = () => (
    <div className="hidden lg:block">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Tu pedido</h3>
        </div>
        <CartContent />
      </div>
    </div>
  );

  const CartContent = () => (
    <div className="space-y-3">
      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 p-2">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(item.product.price_total_igv)} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value))}
                className="h-7 w-14 rounded border border-border bg-background px-1 text-sm"
              >
                {[...Array(Math.min(item.product.stock, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onRemoveItem(item.product.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>{formatPrice(DELIVERY_FEE)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Delivery info indicator */}
      {lastDeliveryInfo && (
        <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-2 text-xs">
          <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium">Enviar a:</p>
            <p className="text-muted-foreground">{lastDeliveryInfo.address}</p>
          </div>
        </div>
      )}

      {/* Action button */}
      <Button
        variant="hero"
        className="w-full"
        onClick={handleConfirmOrder}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : lastDeliveryInfo ? (
          'Confirmar pedido'
        ) : (
          'Confirmar pedido'
        )}
      </Button>

      {!lastDeliveryInfo && (
        <p className="text-center text-xs text-muted-foreground">
          Ingresarás tu dirección de entrega
        </p>
      )}
    </div>
  );

  return (
    <>
      <MobileCart />
      <DesktopCart />

      {/* Delivery Form Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Datos de entrega</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeliverySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_address">Dirección de entrega *</Label>
              <Input
                id="delivery_address"
                value={deliveryForm.address}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                placeholder="Av. Ejemplo 123, Dpto 4B"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Input
                id="district"
                value={deliveryForm.district}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, district: e.target.value })}
                placeholder="Miraflores"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                placeholder="Instrucciones especiales..."
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Pagar ${formatPrice(total)}`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
