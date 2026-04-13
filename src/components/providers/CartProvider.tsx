"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('niza-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Sanitize every item to ensure fields are valid numbers
          const sanitized = parsed.map(item => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0
          }));
          setCart(sanitized);
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('niza-cart', JSON.stringify(cart));
  }, [cart]);

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
