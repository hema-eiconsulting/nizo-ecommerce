"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface CartItem {
  id: string; // product id + size
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 1. Load from localStorage on first mount
  useEffect(() => {
    const savedCart = localStorage.getItem('niza-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsInitialLoad(false);
  }, []);

  // 2. Fetch from DB and merge on login
  useEffect(() => {
    if (session && !isInitialLoad) {
      const fetchDBCart = async () => {
        try {
          const res = await fetch("/api/cart");
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setCart(prev => {
              const merged = [...data.items];
              prev.forEach(localItem => {
                if (!merged.find(dbItem => dbItem.id === localItem.id)) {
                  merged.push(localItem);
                }
              });
              return merged;
            });
          }
        } catch (error) {
          console.error("DB cart fetch error", error);
        }
      };
      fetchDBCart();
    }
  }, [session, isInitialLoad]);

  // 3. Sync to DB and localStorage on every change
  useEffect(() => {
    if (isInitialLoad) return;

    localStorage.setItem('niza-cart', JSON.stringify(cart));

    if (session) {
      const syncCart = async () => {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: cart.map(i => ({
                productId: i.productId,
                size: i.size,
                quantity: i.quantity
              }))
            })
          });
        } catch (error) {
          console.error("Cart sync error", error);
        }
      };
      
      const timeout = setTimeout(syncCart, 1000); // Debounce sync
      return () => clearTimeout(timeout);
    }
  }, [cart, session, isInitialLoad]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const safeQtyToAdd = Math.max(1, Number(newItem.quantity) || 1);
    const cartId = `${newItem.productId}-${newItem.size}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartId);
      if (existing) {
        const newQty = Math.min(existing.quantity + safeQtyToAdd, newItem.maxStock);
        return prev.map(item => 
          item.id === cartId ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...newItem, id: cartId, quantity: safeQtyToAdd }];
    });
    setIsDrawerOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const safeQty = Math.max(1, Number(quantity) || 1);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.min(safeQty, item.maxStock) };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => {
    const itemQty = Number(item.quantity) || 0;
    const itemPrice = Number(item.price) || 0;
    return acc + (itemPrice * itemQty);
  }, 0);

  const itemCount = cart.reduce((acc, item) => {
    return acc + (Number(item.quantity) || 0);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount,
      isDrawerOpen, setIsDrawerOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
