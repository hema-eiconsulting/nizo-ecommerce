"use client";

import Header from "@/components/layout/Header";
import { useCart } from "@/components/providers/CartProvider";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '10rem 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>YOUR CART IS EMPTY</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop" className="btn btn-primary">START SHOPPING</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '3rem', letterSpacing: '2px' }}>YOUR BAG ({itemCount})</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '4rem' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                <div style={{ width: '120px', aspectRatio: '4/5', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>{item.name}</h3>
                    <p style={{ fontWeight: '600' }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}</p>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Size: {item.size}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.5rem 0.75rem' }}><FiMinus size={14} /></button>
                      <span style={{ padding: '0.5rem', width: '30px', textAlign: 'center', fontSize: '0.875rem' }}>{Number.isNaN(item.quantity) ? 1 : item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.5rem 0.75rem' }}><FiPlus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                      <FiTrash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
            <div className="admin-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', letterSpacing: '1px' }}>ORDER SUMMARY</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Shipping</span>
                  <span style={{ color: 'var(--success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Estimated Tax</span>
                  <span>₹0</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.125rem', marginBottom: '2rem' }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                CHECKOUT NOW <FiArrowRight style={{ marginLeft: '0.5rem' }} />
              </Link>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '1.5rem' }}>
              Secure Payment via Razorpay. We support UPI, Cards, Net Banking & COD.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
