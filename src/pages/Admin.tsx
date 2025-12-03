import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingBag, DollarSign, Users, Package, Eye, RefreshCw, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Database } from '@/integrations/supabase/types';
import { AdminCommunity } from '@/components/admin/AdminCommunity';

type OrderStatus = Database['public']['Enums']['order_status'];

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface OrderWithProfile {
  id: string;
  created_at: string | null;
  total_amount: number;
  total_products_amount: number;
  delivery_fee: number | null;
  status: OrderStatus | null;
  payment_method: string;
  delivery_address: string;
  district: string | null;
  telefono: string | null;
  notes: string | null;
  user_id: string;
  profile?: Profile | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price_total_igv: number;
  subtotal: number;
  product_id: string;
  products?: {
    name: string;
    image_url: string | null;
  } | null;
}

interface DashboardStats {
  ordersToday: number;
  salesLast7Days: number;
  totalUsers: number;
  activeProducts: number;
}

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'recibido', label: 'Recibido', color: 'bg-blue-500' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-cyan-500' },
  { value: 'preparando', label: 'Preparando', color: 'bg-yellow-500' },
  { value: 'en_ruta', label: 'En Ruta', color: 'bg-orange-500' },
  { value: 'entregado', label: 'Entregado', color: 'bg-green-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
];

export default function Admin() {
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    salesLast7Days: 0,
    totalUsers: 0,
    activeProducts: 0,
  });
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || !hasRole('admin')) {
        navigate('/');
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (user && hasRole('admin')) {
      fetchDashboardData();
    }
  }, [user, hasRole]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchStats(), fetchOrders()]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [ordersToday, salesData, usersCount, productsCount] = await Promise.all([
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ]);

    const salesLast7Days = salesData.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    setStats({
      ordersToday: ordersToday.count || 0,
      salesLast7Days,
      totalUsers: usersCount.count || 0,
      activeProducts: productsCount.count || 0,
    });
  };

  const fetchOrders = async () => {
    // Fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set(ordersData.map(o => o.user_id))];
    
    // Fetch profiles for these users
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds);

    // Create a map of profiles
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Combine orders with profiles
    const ordersWithProfiles: OrderWithProfile[] = ordersData.map(order => ({
      ...order,
      profile: profilesMap.get(order.user_id) || null,
    }));

    setOrders(ordersWithProfiles);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products:product_id (name, image_url)
      `)
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      return;
    }

    setOrderItems(data as OrderItem[]);
  };

  const openOrderDetail = async (order: OrderWithProfile) => {
    setSelectedOrder(order);
    setDetailOpen(true);
    await fetchOrderItems(order.id);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({ title: 'Estado actualizado', description: `Pedido actualizado a "${newStatus}"` });
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const getStatusBadge = (status: OrderStatus | null) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return (
      <Badge variant="outline" className={`${statusConfig?.color || 'bg-gray-500'} text-white border-0`}>
        {statusConfig?.label || status}
      </Badge>
    );
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

  if (!user || !hasRole('admin')) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold md:text-3xl">Panel de Administración</h1>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersToday}</div>
              <p className="text-xs text-muted-foreground">pedidos recibidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ventas (7 días)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ {stats.salesLast7Days.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">últimos 7 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
              <p className="text-xs text-muted-foreground">activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="comunidad" className="gap-2">
              <Heart className="h-4 w-4" />
              Comunidad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* Orders Section */}
            <Card>
              <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Gestión de Pedidos
                  </CardTitle>
                  <CardDescription>{orders.length} pedidos totales</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {ORDER_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No hay pedidos {statusFilter !== 'all' ? `con estado "${statusFilter}"` : ''}
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Pedido</TableHead>
                          <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                          <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                          <TableHead className="hidden md:table-cell">Fecha</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-mono text-xs">{order.id.slice(0, 8)}...</p>
                                <p className="text-xs text-muted-foreground sm:hidden">
                                  {order.profile?.full_name || order.profile?.email || 'Sin nombre'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div>
                                <p className="font-medium text-sm">{order.profile?.full_name || 'Sin nombre'}</p>
                                <p className="text-xs text-muted-foreground">{order.profile?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">
                              {order.telefono || <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">
                              {order.created_at && format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell className="font-medium">
                              S/ {order.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openOrderDetail(order)}
                              >
                                <Eye className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="comunidad">
            <AdminCommunity />
          </TabsContent>
        </Tabs>

        {/* Order Detail Sheet */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            {selectedOrder && (
              <>
                <SheetHeader>
                  <SheetTitle>Detalle del Pedido</SheetTitle>
                  <SheetDescription>
                    ID: {selectedOrder.id.slice(0, 8)}...
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Status Update */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado del Pedido</label>
                    <Select
                      value={selectedOrder.status || 'recibido'}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as OrderStatus)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Información del Cliente</h4>
                    <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                      <p><span className="text-muted-foreground">Nombre:</span> {selectedOrder.profile?.full_name || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedOrder.profile?.email || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Teléfono:</span> {selectedOrder.profile?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Información de Entrega</h4>
                    <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                      <p><span className="text-muted-foreground">Dirección:</span> {selectedOrder.delivery_address}</p>
                      <p><span className="text-muted-foreground">Distrito:</span> {selectedOrder.district || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Teléfono:</span> {selectedOrder.telefono || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Método de pago:</span> {selectedOrder.payment_method}</p>
                      {selectedOrder.notes && (
                        <p><span className="text-muted-foreground">Notas:</span> {selectedOrder.notes}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Productos</h4>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.products?.name || 'Producto'}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} x S/ {item.unit_price_total_igv.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium">S/ {item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal productos</span>
                      <span>S/ {selectedOrder.total_products_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío</span>
                      <span>S/ {(selectedOrder.delivery_fee || 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>S/ {selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground text-center">
                    Pedido creado el {selectedOrder.created_at && format(new Date(selectedOrder.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
