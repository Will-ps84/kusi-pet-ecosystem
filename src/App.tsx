import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import MyPets from "./pages/MyPets";
import MyAvatar from "./pages/MyAvatar";
import MyProfile from "./pages/MyProfile";
import Vendor from "./pages/Vendor";
import Admin from "./pages/Admin";
import Comunidad from "./pages/Comunidad";
import ComunidadDetail from "./pages/ComunidadDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/mis-pedidos" element={<MyOrders />} />
              <Route path="/pedido/:id" element={<OrderDetail />} />
              <Route path="/mis-mascotas" element={<MyPets />} />
              <Route path="/mi-avatar" element={<MyAvatar />} />
              <Route path="/mi-perfil" element={<MyProfile />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/comunidad" element={<Comunidad />} />
              <Route path="/comunidad/:id" element={<ComunidadDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
