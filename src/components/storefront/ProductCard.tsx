"use client";

import Link from "next/link";
import { FiHeart } from "react-icons/fi";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.sizes.reduce((acc: number, s: any) => acc + s.stock, 0);
  const isSoldOut = totalStock === 0;

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="product-image-container">
        <img src={product.images[0]} alt={product.name} className="product-image" />
        
        {isSoldOut && (
          <div className="sold-out-badge">SOLD OUT</div>
        )}
        
        <button className="wishlist-btn" onClick={(e) => { e.preventDefault(); /* wishlist logic */ }}>
          <FiHeart size={18} />
        </button>
      </Link>
      
      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
              <p className="product-category-tag">{product.category}</p>
              <h3 className="product-name">{product.name}</h3>
           </div>
           <p className="product-price">₹{product.price}</p>
        </div>
        
        <div className="product-sizes-preview">
          {product.sizes.map((s: any) => (
            <span key={s.id} className={`size-dot ${s.stock === 0 ? 'out' : ''}`}>
              {s.size[0]}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
