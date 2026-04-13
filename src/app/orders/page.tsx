"use client";

import Header from "@/components/layout/Header";
import { FiShoppingBag } from "react-icons/fi";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <>
      <Header />
      <div className="container" style={{ padding: '8rem 1rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <FiShoppingBag size={48} color="var(--muted)" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '300', letterSpacing: '8px', marginBottom: '1.5rem' }}>MY ORDERS</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '3rem', letterSpacing: '1px' }}>You haven't placed any orders yet.</p>
        <Link href="/shop" className="btn btn-primary">START SHOPPING</Link>
      </div>
    </>
  );
}
