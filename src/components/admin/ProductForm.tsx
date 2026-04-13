"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiPlus, FiX, FiUploadCloud } from "react-icons/fi";
import Link from "next/link";

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!productId);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    gender: "UNISEX",
    category: "SHIRTS",
    images: [] as string[],
    colors: [] as string[],
    isActive: true,
  });

  const categoryOptions = {
    MEN: [
      { value: "T_SHIRTS", label: "T-Shirts" },
      { value: "SHIRTS", label: "Shirts" },
      { value: "PANTS", label: "Pants" },
      { value: "FOOTWEAR", label: "Footwear" },
      { value: "ACCESSORIES", label: "Accessories" }
    ],
    WOMEN: [
      { value: "TOPS", label: "Tops" },
      { value: "DRESSES", label: "Dresses" },
      { value: "BOTTOMS", label: "Bottoms" },
      { value: "FOOTWEAR", label: "Footwear" },
      { value: "ACCESSORIES", label: "Accessories" }
    ],
    UNISEX: [
      { value: "T_SHIRTS", label: "T-Shirts" },
      { value: "SHIRTS", label: "Shirts" },
      { value: "TOPS", label: "Tops" },
      { value: "DRESSES", label: "Dresses" },
      { value: "PANTS", label: "Pants" },
      { value: "BOTTOMS", label: "Bottoms" },
      { value: "FOOTWEAR", label: "Footwear" },
      { value: "ACCESSORIES", label: "Accessories" }
    ]
  };

  const [sizes, setSizes] = useState([
    { size: "XS", stock: 0 },
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
    { size: "XXL", stock: 0 },
  ]);

  const [newColor, setNewColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      // Pre-fill from URL params if creating new
      const genderParam = searchParams.get("gender");
      const categoryParam = searchParams.get("category");
      
      if (genderParam || categoryParam) {
        setFormData(prev => ({
          ...prev,
          ...(genderParam && { gender: genderParam.toUpperCase() }),
          ...(categoryParam && { category: categoryParam.toUpperCase() }),
        }));
      }
    }
  }, [productId, searchParams]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          gender: data.gender,
          category: data.category,
          images: data.images,
          colors: data.colors,
          isActive: data.isActive,
        });
        
        // Map sizes from DB
        const dbSizes = data.sizes.reduce((acc: any, s: any) => {
          acc[s.size] = s.stock;
          return acc;
        }, {});

        setSizes(sizes.map(s => ({
          ...s,
          stock: dbSizes[s.size] || 0
        })));
      }
    } catch (error) {
      console.error("Error fetching product", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData({ ...formData, colors: [...formData.colors, newColor] });
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) });
  };

  const addImage = () => {
    if (imageUrl) {
      setFormData({ ...formData, images: [...formData.images, imageUrl] });
      setImageUrl("");
    }
  };

  const handleSizeChange = (index: number, val: string) => {
    const newSizes = [...sizes];
    newSizes[index].stock = parseInt(val) || 0;
    setSizes(newSizes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      sizes: sizes.filter(s => s.stock >= 0),
    };

    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error) {
      console.error("Submission error", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div>Loading product data...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <FiArrowLeft /> Back to products
        </Link>
        <h1>{productId ? "Edit Product" : "New Product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Basic Info */}
            <div className="admin-card">
              <h3 style={{ marginBottom: '1rem' }}>General Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label">Product Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea 
                    className="input" 
                    rows={5} 
                    style={{ resize: 'vertical' }}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="admin-card">
              <h3 style={{ marginBottom: '1rem' }}>Product Media</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>Add image URLs (Integration with Cloudinary recommended)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Paste image URL here" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={addImage}>Link</button>
                </div>
                
                <div style={{ padding: '2rem', border: '1px dashed var(--border)', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                   <FiUploadCloud size={32} style={{ color: 'var(--muted)', marginBottom: '0.5rem' }} />
                   <p style={{ fontSize: '0.875rem' }}>Click to upload image</p>
                   <input 
                    type="file" 
                    accept="image/*"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append("file", file);
                      
                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: formData
                        });
                        const data = await res.json();
                        if (data.secure_url) {
                          setFormData(prev => ({ ...prev, images: [...prev.images, data.secure_url] }));
                        }
                      } catch (err) {
                        alert("Upload failed");
                      }
                    }}
                   />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                {formData.images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes & Stock */}
            <div className="admin-card">
              <h3 style={{ marginBottom: '1rem' }}>Inventory & Sizes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                {sizes.map((s, i) => (
                  <div key={s.size}>
                    <label className="label" style={{ textAlign: 'center' }}>{s.size}</label>
                    <input 
                      type="number" 
                      className="input" 
                      style={{ textAlign: 'center' }}
                      value={s.stock}
                      onChange={(e) => handleSizeChange(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {/* Status Card */}
             <div className="admin-card">
                <h3 style={{ marginBottom: '1rem' }}>Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input 
                    type="checkbox" 
                    id="active-check" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <label htmlFor="active-check">Active on storefront</label>
                </div>
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`} 
                  style={{ width: '100%' }}
                  disabled={loading}
                 >
                  {loading ? "Saving..." : (productId ? "Update Product" : "Publish Product")}
                </button>
             </div>

             {/* Pricing & Category */}
             <div className="admin-card">
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Price (INR)</label>
                  <input 
                    type="number" 
                    className="input" 
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Gender</label>
                  <select 
                    className="input" 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Category</label>
                  <select 
                    className="input" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categoryOptions[formData.gender as keyof typeof categoryOptions].map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Colors</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Add color..." 
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={addColor}>+</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.colors.map((c, i) => (
                      <span key={i} style={{ 
                        padding: '0.2rem 0.5rem', 
                        fontSize: '0.75rem', 
                        backgroundColor: '#eee', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        {c} <FiX size={10} style={{ cursor: 'pointer' }} onClick={() => removeColor(c)} />
                      </span>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}
