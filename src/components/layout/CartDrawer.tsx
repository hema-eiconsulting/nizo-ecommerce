"use client";

import { useCart } from "@/components/providers/CartProvider";
import { FiX, FiTrash2, FiMinus, FiPlus, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, isDrawerOpen, setIsDrawerOpen, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>YOUR BAG ({itemCount})</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="close-drawer">
            <FiX size={24} />
          </button>
        </div>

        <div className="drawer-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Your bag is currently empty.</p>
              <button className="btn btn-primary" onClick={() => setIsDrawerOpen(false)}>START SHOPPING</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="drawer-item">
                <div className="drawer-item-img">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="drawer-item-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{item.name}</h3>
                    <p>₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}</p>
                  </div>
                  <p className="drawer-item-size">Size: {item.size}</p>
                  <div className="drawer-item-actions">
                    <div className="qty-picker">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus size={12} /></button>
                      <span>{Number.isNaN(item.quantity) ? 1 : item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        style={{ opacity: item.quantity >= item.maxStock ? 0.3 : 1 }}
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="remove-item">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <p className="drawer-note">Shipping & taxes calculated at checkout.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link 
                href="/cart" 
                className="btn btn-outline" 
                style={{ width: '100%' }}
                onClick={() => setIsDrawerOpen(false)}
              >
                VIEW FULL BAG
              </Link>
              <Link 
                href="/checkout" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => setIsDrawerOpen(false)}
              >
                CHECKOUT NOW <FiArrowRight style={{ marginLeft: '0.5rem' }} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
