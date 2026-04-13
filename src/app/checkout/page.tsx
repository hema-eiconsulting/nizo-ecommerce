"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import Header from "@/components/layout/Header";
import { FiMapPin, FiPhone, FiUser, FiCreditCard, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Order in Backend
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          address,
          totalAmount: total
        })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error);

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Public Key
        amount: orderData.amount,
        currency: "INR",
        name: "NIZO",
        description: "Premium Clothing Order",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderData.dbOrderId
            })
          });

          if (verifyRes.ok) {
            setOrderComplete(true);
            clearCart();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: address.name,
          email: address.email,
          contact: address.phone
        },
        theme: {
          color: "#B08968"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      alert(error.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '10rem 1rem' }}>
          <div style={{ backgroundColor: 'var(--success)', color: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <FiArrowRight size={40} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '300', marginBottom: '1rem', letterSpacing: '5px' }}>THANK YOU</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '3rem' }}>Your order has been placed successfully. A confirmation email has been sent to {address.email}.</p>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '1.25rem 3rem' }}>CONTINUE SHOPPING</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '2.56rem', fontWeight: '300', marginBottom: '4rem', letterSpacing: '8px', textAlign: 'center' }}>CHECKOUT</h1>

        <form onSubmit={handleCheckout} style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '5rem' }}>
          {/* Left Side: Address Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <section>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiUser /> CONTACT INFORMATION
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" required className="input" placeholder="e.g. John Doe" value={address.name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" required className="input" placeholder="e.g. john@example.com" value={address.email} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Phone Number</label>
                  <input type="tel" name="phone" required className="input" placeholder="e.g. +91 98765 43210" value={address.phone} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiMapPin /> SHIPPING ADDRESS
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Street Address</label>
                  <input type="text" name="street" required className="input" placeholder="House No, Building, Street" value={address.street} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" required className="input" placeholder="e.g. Mumbai" value={address.city} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" required className="input" placeholder="e.g. Maharashtra" value={address.state} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Pin Code</label>
                  <input type="text" name="pinCode" required className="input" placeholder="6-digit PIN" value={address.pinCode} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            <section>
               <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiCreditCard /> PAYMENT METHOD
              </h2>
              <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--primary)' }}>
                 <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '5px solid var(--primary)' }}></div>
                 <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600' }}>ONLINE PAYMENT (UPI, CARD, NETBANKING)</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Secure payment via Razorpay</p>
                 </div>
                 <img src="https://razorpay.com/favicon.png" alt="Razorpay" style={{ width: '24px' }} />
              </div>
            </section>
          </div>

          {/* Right Side: Order Summary */}
          <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
            <div className="admin-card" style={{ padding: '2.5rem', backgroundColor: 'var(--secondary)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '2.5rem', letterSpacing: '2px' }}>ORDER SUMMARY</h2>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.name}</h4>
                       <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Qty: {item.quantity} | Size: {item.size}</p>
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                   <span>₹{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--muted)' }}>Shipping</span>
                   <span style={{ color: 'var(--success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.25rem', marginTop: '1rem' }}>
                   <span>TOTAL</span>
                   <span>₹{total}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} 
                style={{ width: '100%', marginTop: '3rem', padding: '1.25rem' }}
                disabled={loading || cart.length === 0}
              >
                {loading ? "PROCCESSING..." : "CONFIRM & PAY NOW"}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2rem' }}>
              By placing this order, you agree to NIZO's Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
