"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";
import Header from "@/components/layout/Header";
import { FiMapPin, FiPhone, FiUser, FiCreditCard, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); // ONLINE or COD
  const [finalTotal, setFinalTotal] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  const [address, setAddress] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  // 1. Pre-fill basic info from session
  useEffect(() => {
    if (session?.user) {
      setAddress(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
        phone: (session.user as any).phone || prev.phone,
      }));
      
      // Fetch saved addresses
      fetch("/api/user/addresses")
        .then(res => res.json())
        .then(data => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            // Pre-fill with default address if available
            const defaultAddr = data.addresses[0];
            setAddress(prev => ({
              ...prev,
              street: defaultAddr.street,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pinCode: defaultAddr.pinCode,
              phone: defaultAddr.phone || prev.phone
            }));
          }
        });
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const selectSavedAddress = (addr: any) => {
    setAddress({
      ...address,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      phone: addr.phone || address.phone
    });
  };

  const validateAddress = () => {
    return address.name && address.email && address.phone && address.street && address.city && address.state && address.pinCode;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else {
      alert("Please fill in all address details.");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFinalTotal(total); // Save total before clearing cart

    try {
      // 1. Save address to user's profile if it's not already there
      await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...address, isDefault: true })
      });

      // 2. Create Order in Backend
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          address,
          totalAmount: total,
          paymentMethod
        })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error);

      // 3. Handle Payment
      if (paymentMethod === "COD") {
        setOrderComplete(true);
        clearCart();
      } else {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "NIZO",
          description: "Order Payment",
          order_id: orderData.orderId,
          handler: async function (response: any) {
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
              alert("Payment verification failed.");
            }
          },
          prefill: {
            name: address.name,
            email: address.email,
            contact: address.phone
          },
          theme: { color: "#B08968" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

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
          <div style={{ backgroundColor: '#22c55e', color: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <FiCheckCircle size={40} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '5px' }}>THANK YOU</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>Your order has been placed successfully.</p>
          {paymentMethod === "COD" && (
            <p style={{ marginBottom: '3rem', fontWeight: '600', fontSize: '1.25rem' }}>
              Please keep ₹{finalTotal} ready for Cash on Delivery.
            </p>
          )}
          <Link href="/profile" className="btn btn-primary" style={{ padding: '1.25rem 3rem' }}>VIEW YOUR ORDERS</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep >= 1 ? 1 : 0.5 }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: currentStep >= 1 ? 'var(--foreground)' : 'var(--muted)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px' }}>ADDRESS</span>
          </div>
          <div style={{ width: '50px', height: '1px', backgroundColor: 'var(--border)', alignSelf: 'center' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep >= 2 ? 1 : 0.5 }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: currentStep >= 2 ? 'var(--foreground)' : 'var(--muted)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px' }}>PAYMENT</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '5rem' }}>
          <div>
            {currentStep === 1 ? (
              <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {savedAddresses.length > 0 && (
                  <section>
                    <h2 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--muted)' }}>SELECT SAVED ADDRESS</h2>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                      {savedAddresses.map(addr => (
                        <div 
                          key={addr.id} 
                          onClick={() => selectSavedAddress(addr)}
                          style={{ minWidth: '200px', padding: '1rem', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          <p style={{ fontWeight: '600' }}>{addr.city}, {addr.state}</p>
                          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{addr.street}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiUser /> CONTACT INFORMATION
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" name="name" required className="input" placeholder="Your Name" value={address.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" name="email" required className="input" placeholder="Your Email" value={address.email} onChange={handleInputChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Phone Number (Mandatory for Delivery)</label>
                      <input type="tel" name="phone" required className="input" placeholder="10-digit Phone Number" value={address.phone} onChange={handleInputChange} />
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
                      <input type="text" name="street" required className="input" placeholder="House No, Street, Locality" value={address.street} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" required className="input" placeholder="City" value={address.city} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" name="state" required className="input" placeholder="State" value={address.state} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Pin Code</label>
                      <input type="text" name="pinCode" required className="input" placeholder="6-digit PIN" value={address.pinCode} onChange={handleInputChange} />
                    </div>
                  </div>
                </section>

                <button type="submit" className="btn btn-primary" style={{ padding: '1.25rem', width: '100%' }}>
                  CONTINUE TO PAYMENT
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                     <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FiCreditCard /> PAYMENT METHOD
                    </h2>
                    <button onClick={() => setCurrentStep(1)} style={{ fontSize: '0.8rem', textDecoration: 'underline', color: 'var(--muted)' }}>
                      Edit Address
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div 
                      onClick={() => setPaymentMethod("COD")}
                      style={{ 
                        padding: '1.5rem', 
                        border: paymentMethod === 'COD' ? '2px solid var(--foreground)' : '1px solid var(--border)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem'
                      }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === 'COD' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--foreground)' }}></div>}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>CASH ON DELIVERY (COD)</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pay ₹{total} when delivered.</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod("ONLINE")}
                      style={{ 
                        padding: '1.5rem', 
                        border: paymentMethod === 'ONLINE' ? '2px solid var(--foreground)' : '1px solid var(--border)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem'
                      }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === 'ONLINE' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--foreground)' }}></div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>ONLINE PAYMENT</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Card, UPI, Netbanking</p>
                      </div>
                    </div>
                  </div>
                </section>

                <button onClick={handleCheckout} className="btn btn-primary" style={{ padding: '1.25rem', width: '100%' }} disabled={loading}>
                  {loading ? "PROCESSING..." : paymentMethod === "COD" ? "PLACE ORDER" : "PROCEED TO PAY"}
                </button>
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
            <div className="admin-card" style={{ padding: '2.5rem', backgroundColor: 'var(--secondary)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '2.5rem', letterSpacing: '2px' }}>ORDER SUMMARY</h2>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', overflow: 'hidden', borderRadius: '4px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontSize: '0.8rem' }}>{item.name}</h4>
                       <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.875rem' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.125rem' }}>
                   <span>TOTAL</span>
                   <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
