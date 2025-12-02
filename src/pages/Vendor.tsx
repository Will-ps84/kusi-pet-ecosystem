import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Package, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import { Product, Category, Vendor } from '@/lib/types';

export default function VendorDashboard() {
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    long_description: '',
    price_total_igv: '',
    stock: '',
    category_id: '',
    species_target: 'ambos' as 'perro' | 'gato' | 'ambos' | 'otros',
    image_url: '',
    is_active: true,
    is_featured: false,
  });
  const [saving, setSaving] = useState(false);

  // Redirect if not vendor
  useEffect(() => {
    if (!authLoading) {
      if (!user || !hasRole('vendor')) {
        navigate('/');
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  // Fetch vendor data and products
  useEffect(() => {
    if (user && hasRole('vendor')) {
      fetchVendorData();
      fetchCategories();
    }
  }, [user, hasRole]);

  const fetchVendorData = async () => {
    try {
      // Get vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (vendorError) throw vendorError;
      setVendor(vendorData as Vendor);

      if (vendorData) {
        // Get vendor's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('vendor_id', vendorData.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData as Product[]);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del vendedor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) {
      setCategories(data as Category[]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      short_description: '',
      long_description: '',
      price_total_igv: '',
      stock: '',
      category_id: '',
      species_target: 'ambos',
      image_url: '',
      is_active: true,
      is_featured: false,
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      short_description: product.short_description || '',
      long_description: product.long_description || '',
      price_total_igv: product.price_total_igv.toString(),
      stock: product.stock?.toString() || '0',
      category_id: product.category_id || '',
      species_target: product.species_target || 'ambos',
      image_url: product.image_url || '',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' });
      return;
    }

    if (!formData.price_total_igv || parseFloat(formData.price_total_igv) <= 0) {
      toast({ title: 'Error', description: 'El precio debe ser mayor a 0', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        short_description: formData.short_description.trim() || null,
        long_description: formData.long_description.trim() || null,
        price_total_igv: parseFloat(formData.price_total_igv),
        stock: parseInt(formData.stock) || 0,
        category_id: formData.category_id || null,
        species_target: formData.species_target,
        image_url: formData.image_url.trim() || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        vendor_id: vendor.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Producto actualizado correctamente' });
      } else {
        const { error } = await supabase.from('products').insert(productData);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Producto creado correctamente' });
      }

      setDialogOpen(false);
      resetForm();
      fetchVendorData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el producto',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !hasRole('vendor')) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold md:text-3xl">Panel de Vendedor</h1>

        {/* Vendor Info Card */}
        {vendor && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                {vendor.business_name}
              </CardTitle>
              <CardDescription>Información de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm">
              {vendor.contact_email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {vendor.contact_email}
                </div>
              )}
              {vendor.contact_phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {vendor.contact_phone}
                </div>
              )}
              {vendor.tax_id && (
                <div className="text-muted-foreground">RUC: {vendor.tax_id}</div>
              )}
              <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
                {vendor.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {!vendor && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No tienes un perfil de vendedor configurado.</p>
              <p className="text-sm">Contacta al administrador para configurar tu tienda.</p>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        {vendor && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Mis Productos
                </CardTitle>
                <CardDescription>{products.length} producto(s)</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre del producto"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio (S/) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price_total_igv}
                          onChange={(e) => setFormData({ ...formData, price_total_igv: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="short_description">Descripción corta</Label>
                      <Input
                        id="short_description"
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="Breve descripción"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="long_description">Descripción completa</Label>
                      <Textarea
                        id="long_description"
                        value={formData.long_description}
                        onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                        placeholder="Descripción detallada del producto"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="species">Especie objetivo</Label>
                        <Select
                          value={formData.species_target}
                          onValueChange={(value) => setFormData({ ...formData, species_target: value as typeof formData.species_target })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perro">Perro</SelectItem>
                            <SelectItem value="gato">Gato</SelectItem>
                            <SelectItem value="ambos">Ambos</SelectItem>
                            <SelectItem value="otros">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">URL de imagen</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Activo</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_featured"
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                        <Label htmlFor="is_featured">Destacado</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingProduct ? 'Guardar' : 'Crear'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No tienes productos aún. ¡Crea tu primer producto!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="hidden sm:table-cell">Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                S/ {product.price_total_igv.toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            S/ {product.price_total_igv.toFixed(2)}
                          </TableCell>
                          <TableCell>{product.stock ?? 0}</TableCell>
                          <TableCell>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
