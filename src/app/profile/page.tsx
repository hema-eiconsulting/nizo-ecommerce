"use client";

import { useSession, signOut } from "next-auth/react";
import Header from "@/components/layout/Header";
import { FiUser, FiPackage, FiLogOut, FiSettings, FiShoppingCart, FiSearch, FiClock, FiMail, FiMapPin } from "react-icons/fi";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const res = await fetch("/api/user/profile");
          const data = await res.json();
          
          if (res.ok) {
            setOrders(data.orders || []);
            setCartItems(data.cartItems || []);
            setSearchHistory(data.searchHistory || []);
          }
        } catch (error) {
          console.error("Error fetching profile data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [session]);

  if (status === "loading" || (session && loading)) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="skeleton-text">Loading your dashboard...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 1rem' }}>
         <h1 style={{ fontSize: '2rem', marginBottom: '2rem', letterSpacing: '4px' }}>PLEASE SIGN IN</h1>
         <p style={{ color: 'var(--muted)', marginBottom: '3rem' }}>You need to be logged in to view your profile.</p>
         <Link href="/login" className="btn btn-primary">SIGN IN NOW</Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '10rem' }}>
        <div className="profile-header">
          <div className="profile-user-info">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {(session.user?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-user-text">
              <span className="product-category-tag">Welcome back</span>
              <h1 className="profile-user-name">{session.user?.name || "Customer"}</h1>
              <p className="profile-user-email">
                <FiMail /> {session.user?.email}
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn btn-outline profile-signout-btn"
          >
            <FiLogOut /> SIGN OUT
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
          
          {/* Recent Orders Section */}
          <section className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <FiPackage size={24} />
              <h2 style={{ fontSize: '1.25rem', letterSpacing: '2px' }}>RECENT ORDERS</h2>
            </div>
            {orders.length === 0 ? (
              <div className="dashboard-empty">
                <p>No orders yet.</p>
                <Link href="/shop" style={{ textDecoration: 'underline', fontSize: '0.875rem' }}>Start shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.slice(0, 3).map((order: any) => (
                  <Link href={`/orders/${order.id}`} key={order.id} className="order-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600' }}>#{order.id.slice(-8).toUpperCase()}</span>
                      <span className="status-pill">{order.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--muted)' }}>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </Link>
                ))}
                {orders.length > 3 && (
                  <Link href="/orders" className="link-btn">View all orders ({orders.length})</Link>
                )}
              </div>
            )}
          </section>

          {/* Cart Items Section */}
          <section className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <FiShoppingCart size={24} />
              <h2 style={{ fontSize: '1.25rem', letterSpacing: '2px' }}>SAVED IN BAG</h2>
            </div>
            {cartItems.length === 0 ? (
              <div className="dashboard-empty">
                <p>Your bag is empty.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {cartItems.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '75px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '600' }}>{item.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: '600' }}>₹{item.price}</p>
                  </div>
                ))}
                <Link href="/cart" className="btn btn-primary" style={{ marginTop: '1rem' }}>GO TO BAG</Link>
              </div>
            )}
          </section>

          {/* Search History Section */}
          <section className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <FiSearch size={24} />
              <h2 style={{ fontSize: '1.25rem', letterSpacing: '2px' }}>RECENT SEARCHES</h2>
            </div>
            {searchHistory.length === 0 ? (
              <div className="dashboard-empty">
                <p>No recent searches.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {searchHistory.map((search: any) => (
                  <Link 
                    href={`/shop?search=${encodeURIComponent(search.query)}`} 
                    key={search.id} 
                    className="search-tag"
                  >
                    <FiClock size={12} /> {search.query}
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      <style jsx>{`
        .dashboard-section {
          background: white;
          padding: 2.5rem;
          border: 1px solid var(--border);
        }
        .dashboard-empty {
          padding: 2rem;
          background: var(--secondary);
          text-align: center;
          color: var(--muted);
          font-size: 0.875rem;
        }
        .order-summary-card {
          padding: 1rem;
          border: 1px solid var(--border);
          transition: all 0.2s;
          display: block;
        }
        .order-summary-card:hover {
          border-color: var(--foreground);
          transform: translateY(-2px);
        }
        .status-pill {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          background: var(--foreground);
          color: white;
          text-transform: uppercase;
        }
        .search-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.8125rem;
          transition: all 0.2s;
        }
        .search-tag:hover {
          border-color: var(--foreground);
          background: white;
        }
      `}</style>
    </>
  );
}
