"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import FeaturedProducts from "@/components/storefront/FeaturedProducts";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>YOUR DAILY STYLE</h1>
            <p>Quality clothing for your everyday needs.</p>
            <Link href="/shop" className="btn btn-primary" style={{ marginTop: '2rem', padding: '1rem 3rem' }}>EXPLORE COLLECTION</Link>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories container">
          <div className="category-grid">
            <div className="category-card men">
              <div className="category-overlay">
                <h2>MEN</h2>
                <Link href="/shop/men" className="btn btn-outline" style={{ marginTop: '1rem', border: '1px solid var(--foreground)' }}>
                  SHOP MEN
                </Link>
              </div>
            </div>
            <div className="category-card women">
              <div className="category-overlay">
                <h2>WOMEN</h2>
                <Link href="/shop/women" className="btn btn-outline" style={{ marginTop: '1rem', border: '1px solid var(--foreground)' }}>
                  SHOP WOMEN
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Featured Products Placeholder */}
        <section className="featured container" style={{ padding: '5rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NEW ARRIVALS</h2>
            <Link href="/shop" className="btn btn-outline">VIEW ALL</Link>
          </div>
          
          <FeaturedProducts />
        </section>

        <section className="newsletter">
            <div className="container" style={{ padding: '8rem 1rem' }}>
              <div style={{ backgroundColor: 'var(--foreground)', color: 'white', padding: '6rem 4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', letterSpacing: '4px', marginBottom: '1.5rem' }}>BE PART OF OUR WORLD</h2>
                <p style={{ opacity: 0.7, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                  Subscribe to receive updates, access to exclusive deals, and more.
                </p>
                <div style={{ display: 'flex', gap: '0', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                  <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL" 
                    className="input" 
                    style={{ background: 'transparent', border: 'none', color: 'white', letterSpacing: '2px', textAlign: 'center' }} 
                  />
                  <button style={{ color: 'white', padding: '1rem', fontWeight: '600', letterSpacing: '2px' }}>JOIN</button>
                </div>
              </div>
            </div>
        </section>

        <footer style={{ padding: '8rem 0 4rem', backgroundColor: 'var(--secondary)', textAlign: 'center' }}>
          <div className="container">
            <div className="logo" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
              <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '64px', width: 'auto' }} />
            </div>
            <div className="footer-links" style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginBottom: '4rem', fontSize: '0.75rem', letterSpacing: '2px' }}>
              <Link href="/shop">SHOP</Link>
              <Link href="/profile">MY ACCOUNT</Link>
              <Link href="/">SUPPORT</Link>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.65rem', letterSpacing: '1px' }}>© 2026 NIZO CLOTHING STORE. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>

      </main>
    </>
  );
}
