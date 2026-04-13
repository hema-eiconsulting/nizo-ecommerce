"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/storefront/ProductCard";
import { FiFilter, FiX } from "react-icons/fi";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const gender = searchParams.get("gender") || "ALL";
  const category = searchParams.get("category") || "ALL";
  const q = searchParams.get("q") || "";

  useEffect(() => {
    fetchProducts();
  }, [gender, category, q]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/api/products?";
      if (gender !== "ALL") url += `gender=${gender}&`;
      if (category !== "ALL") url += `category=${category}&`;
      if (q) url += `q=${encodeURIComponent(q)}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/shop");
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {q ? `RESULTS FOR: "${q}"` : `${gender !== "ALL" ? gender : "ALL"} ${category !== "ALL" ? category : "CLOTHING"}`}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{products.length} products found</p>
          </div>
          <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter style={{ marginRight: '0.5rem' }} /> Filters
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '250px 1fr' : '1fr', gap: '3rem', transition: 'all 0.3s' }}>
          {showFilters && (
            <aside className="filters-sidebar">
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <h3 style={{ fontSize: '1rem' }}>GENDER</h3>
                   <button onClick={clearFilters} style={{ fontSize: '0.75rem', textDecoration: 'underline', color: 'var(--muted)' }}>Clear All</button>
                </div>
                <div className="filter-group">
                  {["ALL", "MEN", "WOMEN", "UNISEX"].map(g => (
                    <label key={g} className="filter-label">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={gender === g} 
                        onChange={() => updateFilter("gender", g)}
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>CATEGORY</h3>
                <div className="filter-group">
                  {["ALL", "SHIRTS", "TOPS", "BOTTOMS", "DRESSES", "TROUSERS", "JACKETS", "ACCESSORIES"].map(c => (
                    <label key={c} className="filter-label">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={category === c} 
                        onChange={() => updateFilter("category", c)}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem 2rem' }}>
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-md)' }}></div>
              ))
            ) : (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}

            {!loading && products.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0' }}>
                <h3>No products match your filters.</h3>
                <button className="btn btn-primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
