"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/storefront/ProductCard";
import { FiFilter, FiGrid, FiLayers, FiStar, FiMaximize, FiFeather, FiBriefcase, FiShield, FiWatch } from "react-icons/fi";

export default function GenderShopPage({ params: paramsPromise }: { params: Promise<{ gender: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = use(paramsPromise);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // gender is from URL path: /shop/men or /shop/women
  const pathGender = (params?.gender as string)?.toUpperCase() || "ALL";
  const category = searchParams.get("category") || "ALL";

  useEffect(() => {
    fetchProducts();
  }, [pathGender, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/api/products?";
      if (pathGender !== "ALL") url += `gender=${pathGender}&`;
      if (category !== "ALL") url += `category=${category}&`;
      
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

  const updateCategory = (value: string) => {
    const qParams = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      qParams.delete("category");
    } else {
      qParams.set("category", value);
    }
    router.push(`/shop/${params.gender}?${qParams.toString()}`);
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        
        {/* Collection Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
           <h1 style={{ fontSize: '3.5rem', fontWeight: '300', letterSpacing: '12px', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {pathGender === 'MEN' ? 'Men’s Collection' : pathGender === 'WOMEN' ? 'Women’s Collection' : 'Unisex Styles'}
           </h1>
           <p style={{ color: 'var(--muted)', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
              {products.length} Items Available
           </p>
        </div>

        {/* Category Bar Showcase */}
        <div className="category-bar-wrapper">
          <div className="category-bar">
            {[
              { id: "ALL", label: "All", icon: <FiGrid size={24} /> },
              ...(pathGender === 'MEN' ? [
                { id: "T_SHIRTS", label: "T-Shirts", icon: <FiLayers size={24} /> },
                { id: "SHIRTS", label: "Shirts", icon: <FiBriefcase size={24} /> },
                { id: "PANTS", label: "Pants", icon: <FiMaximize size={24} /> },
                { id: "FOOTWEAR", label: "Footwear", icon: <FiFeather size={24} /> },
                { id: "ACCESSORIES", label: "Accessories", icon: <FiWatch size={24} /> }
              ] : pathGender === 'WOMEN' ? [
                { id: "TOPS", label: "Tops", icon: <FiStar size={24} /> },
                { id: "DRESSES", label: "Dresses", icon: <FiFeather size={24} /> },
                { id: "BOTTOMS", label: "Bottoms", icon: <FiMaximize size={24} /> },
                { id: "FOOTWEAR", label: "Footwear", icon: <FiBriefcase size={24} /> },
                { id: "ACCESSORIES", label: "Accessories", icon: <FiWatch size={24} /> }
              ] : [])
            ].map((cat) => (
              <div 
                key={cat.id} 
                className={`category-tile ${category === cat.id ? 'active' : ''}`}
                onClick={() => updateCategory(cat.id)}
              >
                <div className="category-tile-img">
                  {cat.icon}
                </div>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button className="btn btn-outline" style={{ borderRadius: '20px', padding: '0.5rem 1.5rem', fontSize: '0.8rem' }} onClick={() => setShowFilters(!showFilters)}>
            <FiFilter style={{ marginRight: '0.5rem' }} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '250px 1fr' : '1fr', gap: '3rem' }}>
          {showFilters && (
            <aside className="filters-sidebar">
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>CATEGORY</h3>
                <div className="filter-group">
                  {["ALL", 
                    ...(pathGender === 'MEN' ? ["T_SHIRTS", "SHIRTS", "PANTS", "FOOTWEAR", "ACCESSORIES"] : []),
                    ...(pathGender === 'WOMEN' ? ["TOPS", "DRESSES", "BOTTOMS", "FOOTWEAR", "ACCESSORIES"] : [])
                  ].map(c => (
                    <label key={c} className="filter-label">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={category === c} 
                        onChange={() => updateCategory(c)}
                      />
                      <span>{c.replace("_", "-")}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem 2rem' }}>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-md)' }}></div>
              ))
            ) : (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}

            {!loading && products.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0' }}>
                <h3>No products found for this category.</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
