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

        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="logo" style={{ marginBottom: '1.5rem' }}>
                  <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '56px', width: 'auto' }} />
                </div>
                <p className="footer-tagline">Quality clothing for your everyday style — designed for men &amp; women who move with confidence.</p>
                <a href="mailto:nizoecommerceapp@gmail.com" className="footer-email">
                  ✉ nizoecommerceapp@gmail.com
                </a>
              </div>
              <div className="footer-nav-group">
                <h4 className="footer-nav-title">EXPLORE</h4>
                <Link href="/shop">Shop All</Link>
                <Link href="/shop/men">Men</Link>
                <Link href="/shop/women">Women</Link>
                <Link href="/new-arrivals">New Arrivals</Link>
              </div>
              <div className="footer-nav-group">
                <h4 className="footer-nav-title">ACCOUNT</h4>
                <Link href="/profile">My Account</Link>
                <Link href="/orders">My Orders</Link>
                <Link href="/cart">My Bag</Link>
              </div>
              <div className="footer-nav-group">
                <h4 className="footer-nav-title">SUPPORT</h4>
                <a href="mailto:nizoecommerceapp@gmail.com">Contact Us</a>
                <Link href="/">Returns &amp; Exchanges</Link>
                <Link href="/">Size Guide</Link>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2026 NIZO CLOTHING STORE. ALL RIGHTS RESERVED.</p>
              <p className="footer-contact-note">For support: <a href="mailto:nizoecommerceapp@gmail.com">nizoecommerceapp@gmail.com</a></p>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
