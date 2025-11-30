import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Cart } from '@/lib/types';
import { toast } from 'sonner';

const DELIVERY_FEE = 7.00;

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateCart = (items: CartItem[]): Cart => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price_total_igv * item.quantity, 0);
  return {
    items,
    subtotal,
    deliveryFee: items.length > 0 ? DELIVERY_FEE : 0,
    total: subtotal + (items.length > 0 ? DELIVERY_FEE : 0),
  };
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kusi-pet-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('kusi-pet-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error('No hay suficiente stock disponible');
          return prev;
        }
        toast.success(`${product.name} actualizado en el carrito`);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      if (quantity > product.stock) {
        toast.error('No hay suficiente stock disponible');
        return prev;
      }
      toast.success(`${product.name} agregado al carrito`);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.success('Producto eliminado del carrito');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            toast.error('No hay suficiente stock disponible');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cart = calculateCart(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
