import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, SPECIES_TARGET_LABELS } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, ShoppingCart, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminProductForm } from '@/components/admin/AdminProductForm';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSpecies, setSelectedSpecies] = useState(searchParams.get('species') || 'all');
  const { addToCart } = useCart();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  // Admin state
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Admin sees all products, regular users only see active ones
      const productsQuery = supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });
      
      if (!isAdmin) {
        productsQuery.eq('is_active', true);
      }

      const [productsRes, categoriesRes, featuredRes] = await Promise.all([
        productsQuery,
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(4),
      ]);

      if (productsRes.data) setProducts(productsRes.data as unknown as Product[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      if (featuredRes.data) setFeaturedProducts(featuredRes.data as unknown as Product[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);
      if (error) throw error;
      toast.success('Producto eliminado');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el producto');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setEditingProduct(null);
    fetchData();
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        product.category?.name.toLowerCase().replace(/ /g, '-') === selectedCategory.toLowerCase();
      
      const matchesSpecies = selectedSpecies === 'all' ||
        product.species_target === selectedSpecies ||
        product.species_target === 'ambos';

      return matchesSearch && matchesCategory && matchesSpecies;
    });
  }, [products, searchQuery, selectedCategory, selectedSpecies]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`;
  };

  return (
    <Layout>
      {/* Featured Banner */}
      {featuredProducts.length > 0 && (
        <section className="bg-gradient-to-r from-teal-light to-lavender py-8">
          <div className="container">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Productos destacados</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/producto/${product.id}`}
                  className="group rounded-xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">📦</div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="line-clamp-1 font-medium text-foreground">{product.name}</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(product.price_total_igv)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          {/* Admin Header */}
          {isAdmin && (
            <div className="mb-6 flex items-center justify-between rounded-lg bg-primary/10 p-4">
              <div>
                <h2 className="font-semibold text-foreground">Panel de Administración</h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona productos, ve todos los estados (activos/inactivos)
                </p>
              </div>
              <Button onClick={() => { setEditingProduct(null); setProductFormOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Producto
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name.toLowerCase().replace(/ /g, '-')}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="perro">Perros</SelectItem>
                  <SelectItem value="gato">Gatos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-muted" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">No encontramos productos</h3>
              <p className="text-muted-foreground">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group relative rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-md ${!product.is_active ? 'border-destructive/50 opacity-70' : 'border-border'}`}
                >
                  {/* Admin badge for inactive products */}
                  {isAdmin && !product.is_active && (
                    <div className="absolute left-2 top-2 z-10 rounded bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
                      Inactivo
                    </div>
                  )}

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="absolute right-2 top-2 z-10 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleEditProduct(product, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDeleteClick(product, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Link to={`/producto/${product.id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-xl bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">📦</div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/producto/${product.id}`}>
                      <p className="mb-1 line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
                        {product.name}
                      </p>
                    </Link>
                    
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {product.category?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {SPECIES_TARGET_LABELS[product.species_target]}
                      </span>
                      {isAdmin && (
                        <span className="text-xs text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(product.price_total_igv)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock < 1}
                        className="text-primary hover:bg-primary/10"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {product.stock < 5 && product.stock > 0 && (
                      <p className="mt-2 text-xs text-accent">
                        ¡Solo quedan {product.stock} unidades!
                      </p>
                    )}
                    {product.stock < 1 && (
                      <p className="mt-2 text-xs text-destructive">Agotado</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Admin Product Form Dialog */}
      <AdminProductForm
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
