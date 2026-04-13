"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/storefront/ProductCard";

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      // Fetch latest products
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        // Just take the first 8 for "New Arrivals" or handle sizing/sorting
        setProducts(data.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch new arrivals", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '5rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '300', letterSpacing: '10px', marginBottom: '1.5rem' }}>NEW ARRIVALS</h1>
          <p style={{ color: 'var(--muted)', letterSpacing: '2px' }}>DISCOVER THE LATEST PIECES FROM OUR CURRENT SEASON.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4rem 2rem' }}>
          {loading ? (
             [1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-sm)' }}></div>
            ))
          ) : (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
