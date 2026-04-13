"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronDown } from "react-icons/fi";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
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

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Products</h1>
          <p style={{ color: 'var(--muted)' }}>Manage your apparel catalog</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="quick-add-container" style={{ position: 'relative' }}>
            <button className="btn btn-secondary">
              <FiPlus style={{ marginRight: '0.5rem' }} /> Quick Add <FiChevronDown style={{ marginLeft: '0.5rem' }} />
            </button>
            <div className="quick-add-menu">
              <Link href="/admin/products/new?gender=MEN&category=T_SHIRTS" className="quick-add-item">Men's T-Shirts</Link>
              <Link href="/admin/products/new?gender=MEN&category=SHIRTS" className="quick-add-item">Men's Shirts</Link>
              <Link href="/admin/products/new?gender=MEN&category=PANTS" className="quick-add-item">Men's Pants</Link>
              <Link href="/admin/products/new?gender=WOMEN&category=TOPS" className="quick-add-item">Women's Tops</Link>
              <Link href="/admin/products/new?gender=WOMEN&category=DRESSES" className="quick-add-item">Women's Dresses</Link>
            </div>
          </div>
          <Link href="/admin/products/new" className="btn btn-primary">
            Standard Add
          </Link>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FiSearch style={{ position: 'absolute', left: '1rem', color: 'var(--muted)' }} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="input" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }}></div>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem' }}>Product</th>
                <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                <th style={{ padding: '1rem 1.5rem' }}>Price</th>
                <th style={{ padding: '1rem 1.5rem' }}>Stock</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const totalStock = product.sizes.reduce((acc: number, s: any) => acc + s.stock, 0);
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: '#eee', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            {product.images[0] && <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{product.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{product.gender}</div>
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>{product.category}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>₹{product.price}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        color: totalStock === 0 ? 'var(--danger)' : 'inherit',
                        fontWeight: totalStock === 0 ? 'bold' : 'normal'
                      }}>
                        {totalStock === 0 ? 'SOLD OUT' : totalStock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem',
                        backgroundColor: product.isActive ? '#e6f7ed' : '#f5f5f5',
                        color: product.isActive ? 'var(--success)' : 'var(--muted)'
                      }}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link href={`/admin/products/${product.id}`} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '4px' }}>
                          <FiEdit2 size={16} />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '4px', color: 'var(--danger)' }}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
