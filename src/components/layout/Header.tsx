"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiShoppingCart, FiUser, FiSearch, FiX, FiMenu } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";

export default function Header() {
  const { data: session } = useSession();
  const { itemCount, setIsDrawerOpen } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // Log search history if logged in
      if (session) {
        fetch("/api/search-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }).catch(err => console.error("Search logging failed", err));
      }
      
      router.push(`/shop?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="main-header">
      <div className="container header-container">
        {/* Mobile Menu Trigger */}
        <button className="mobile-menu-trigger icon-btn" onClick={() => setIsMobileNavOpen(true)}>
          <FiMenu size={24} />
        </button>

        {/* Left Side: Branding */}
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '64px', width: 'auto' }} />
        </Link>

        {/* Center: Navigation - Hidden when search is open on small screens, or just always there */}
        {!isSearchOpen && (
          <nav className="main-nav center-nav desktop-nav">
            <Link href="/shop/men">MEN</Link>
            <Link href="/shop/women">WOMEN</Link>
            <Link href="/shop">SHOP ALL</Link>
            <Link href="/new-arrivals">NEW</Link>
          </nav>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-nav-header">
              <h2>MENU</h2>
              <button onClick={() => setIsMobileNavOpen(false)} className="icon-btn">
                <FiX size={24} />
              </button>
            </div>
            <nav className="mobile-nav-links">
              <Link href="/shop/men" onClick={() => setIsMobileNavOpen(false)}>MEN</Link>
              <Link href="/shop/women" onClick={() => setIsMobileNavOpen(false)}>WOMEN</Link>
              <Link href="/shop" onClick={() => setIsMobileNavOpen(false)}>SHOP ALL</Link>
              <Link href="/new-arrivals" onClick={() => setIsMobileNavOpen(false)}>NEW ARRIVALS</Link>
            </nav>
          </div>
        )}

        {/* Search Overlay/Input */}
        {isSearchOpen && (
          <form 
            onSubmit={handleSearch} 
            className="search-overlay"
          >
            <input 
              autoFocus
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-overlay-input"
            />
            <button type="submit" className="icon-btn"><FiSearch size={18} /></button>
            <button 
              type="button" 
              onClick={() => setIsSearchOpen(false)} 
              className="icon-btn search-close-btn"
            >
              <FiX size={18} />
            </button>
          </form>
        )}

        {/* Right Side: Actions */}
        <div className="header-actions">
          {!isSearchOpen && (
            <button onClick={() => setIsSearchOpen(true)} className="icon-btn search-trigger">
              <FiSearch size={20} />
            </button>
          )}
          <button onClick={() => setIsDrawerOpen(true)} className="icon-btn cart-btn">
            <FiShoppingCart size={21} />
            <span className="cart-count">{itemCount || 0}</span>
          </button>
          <Link href={session ? "/profile" : "/login"} className="icon-btn">
            <FiUser size={21} />
          </Link>
        </div>
      </div>
    </header>

  );
}
