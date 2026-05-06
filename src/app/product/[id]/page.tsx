"use client";

import React, { useState, useEffect, use } from "react";
import Header from "@/components/layout/Header";
import { FiHeart, FiShare2, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cart, addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    const sizeObj = product.sizes.find((s: any) => s.size === selectedSize);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      quantity: quantity,
      maxStock: sizeObj ? sizeObj.stock : 1
    });
  };


  if (loading) return <div className="container" style={{ padding: '5rem' }}>Loading product details...</div>;
  if (!product) return <div className="container" style={{ padding: '5rem' }}>Product not found.</div>;

  const totalStock = product.sizes.reduce((acc: number, s: any) => acc + s.stock, 0);
  const isSoldOut = totalStock === 0;

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <Link 
          href="/shop" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)', marginBottom: '3rem', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '2px' }}
        >
          <FiArrowLeft size={20} /> GO BACK
        </Link>

        <div className="product-detail-grid">
          {/* Left: Gallery */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '70px', flexShrink: 0 }}>
                {product.images.map((img: string, i: number) => (
                  <div 
                    key={i} 
                    style={{ 
                      cursor: 'pointer', 
                      opacity: mainImage === img ? 1 : 0.5, 
                      border: mainImage === img ? '1px solid var(--foreground)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setMainImage(img)}
                  >
                    <img src={img} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
             </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-sm)' }}>
                {mainImage && (
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      display: 'block',
                      animation: 'fadeIn 0.5s ease' 
                    }} 
                  />
                )}
                {isSoldOut && <div className="sold-out-badge" style={{ transform: 'translate(-50%, -50%) rotate(-10deg)', fontSize: '1.5rem', padding: '0.75rem 2rem' }}>SOLD OUT</div>}
              </div>
          </div>
 
          {/* Right: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '0.5rem' }}>
             <div>
                <p style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                   {product.gender} — {product.category}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                  <h1 style={{ fontSize: '2.25rem', fontWeight: '500', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.name}</h1>
                  <button onClick={() => setIsWishlisted(!isWishlisted)} style={{ color: isWishlisted ? 'var(--danger)' : 'inherit', marginTop: '0.5rem' }}>
                    <FiHeart size={24} fill={isWishlisted ? 'var(--danger)' : 'none'} />
                  </button>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', color: 'var(--foreground)' }}>₹{product.price.toLocaleString()}</p>
             </div>

             <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>SELECT SIZE</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                   {product.sizes.map((s: any) => {
                     const outOfStock = s.stock === 0;
                     return (
                       <button
                         key={s.id}
                         onClick={() => {
                           setSelectedSize(s.size);
                           setQuantity(1);
                         }}
                         className={`size-button ${selectedSize === s.size ? 'active' : ''} ${outOfStock ? 'out-of-stock-style' : ''}`}
                       >
                         {s.size}
                       </button>
                     );
                   })}
                </div>
             </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(() => {
                  const sizeObj = product.sizes.find((s: any) => s.size === selectedSize);
                  const dbStock = sizeObj?.stock ?? 0;
                  
                  // Find how many of THIS product/size are already in the cart
                  const inCartItem = cart.find(item => item.productId === product.id && item.size === selectedSize);
                  const inCartQty = inCartItem?.quantity ?? 0;
                  
                  const availableStock = Math.max(0, dbStock - inCartQty);
                  const isCurrentSizeOOS = selectedSize && availableStock <= 0;

                  if (isSoldOut || isCurrentSizeOOS) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '500' }}>
                          {selectedSize && dbStock > 0 && inCartQty >= dbStock ? "ALL AVAILABLE STOCK IS IN YOUR BAG" : "CURRENTLY OUT OF STOCK"}
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                          NOTIFY ME WHEN {selectedSize} IS RESTOCKED
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedSize && availableStock < 5 && availableStock > 0 && (
                        <p style={{ color: '#d35400', fontSize: '0.8rem', fontWeight: '600' }}>
                          HURRY! ONLY {availableStock} {availableStock === 1 ? 'PIECE' : 'PIECES'} LEFT
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 1rem' }}>-</button>
                          <span style={{ padding: '0.75rem 0.5rem', width: '40px', textAlign: 'center' }}>{quantity}</span>
                          <button 
                            onClick={() => {
                              if (quantity < availableStock) setQuantity(quantity + 1);
                            }} 
                            style={{ padding: '0 1rem' }}
                          >+</button>
                        </div>
                        <button 
                          className={`btn btn-primary ${!selectedSize ? 'btn-disabled' : ''}`} 
                          style={{ flex: 1, padding: '1rem' }}
                          disabled={!selectedSize}
                          onClick={handleAddToCart}
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  );
                })()}
                <button className="btn btn-outline" style={{ width: '100%', padding: '1rem' }}>
                  <FiShare2 style={{ marginRight: '0.5rem' }} /> SHARE PRODUCT
                </button>
             </div>

             <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>DESCRIPTION</h3>
                <p style={{ color: 'var(--muted)', lineHeight: '1.8' }}>{product.description || "No description available."}</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
