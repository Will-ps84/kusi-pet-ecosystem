import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product, SPECIES_TARGET_LABELS } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Minus, Plus, ArrowLeft, Check, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data as unknown as Product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setQuantity(1);
    }
  };

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="mb-4 h-6 w-32 rounded bg-muted" />
            <div className="grid gap-8 md:grid-cols-2">
              <div className="aspect-square rounded-2xl bg-muted" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/4 rounded bg-muted" />
                <div className="h-10 w-1/3 rounded bg-muted" />
                <div className="h-32 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="mb-4 text-6xl">😿</div>
          <h1 className="mb-2 text-2xl font-bold">Producto no encontrado</h1>
          <p className="mb-4 text-muted-foreground">
            El producto que buscas no existe o fue eliminado.
          </p>
          <Link to="/marketplace">
            <Button variant="hero">Volver al marketplace</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al marketplace
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-8xl">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {product.category?.name}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                {SPECIES_TARGET_LABELS[product.species_target]}
              </span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-foreground">{product.name}</h1>

            <p className="mb-4 text-lg text-muted-foreground">{product.short_description}</p>

            <div className="mb-6">
              <p className="text-4xl font-bold text-primary">
                {formatPrice(product.price_total_igv)}
              </p>
              <p className="text-sm text-muted-foreground">
                Precio final, incluye IGV.
              </p>
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-foreground">
                    {product.stock > 10 ? 'Disponible' : `Solo ${product.stock} en stock`}
                  </span>
                </div>
              ) : (
                <p className="text-destructive">Producto agotado</p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="hero" size="lg" onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="h-5 w-5" />
                  Agregar al carrito
                </Button>
              </div>
            )}

            {/* Vendor */}
            {product.vendor && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendido por</p>
                  <p className="font-medium text-foreground">{product.vendor.business_name}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {product.long_description && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold text-foreground">Descripción</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {product.long_description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
