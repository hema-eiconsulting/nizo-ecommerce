"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { FiPackage, FiArrowLeft, FiShoppingBag } from "react-icons/fi";

export default function OrdersListPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then(r => r.json())
        .then(data => {
          setOrders(data.orders || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  const statusColor: Record<string, string> = {
    PROCESSING:      "#B08968",
    CONFIRMED:       "#6ab04c",
    READY_TO_SHIP:   "#3498db",
    SHIPPED:         "#9b59b6",
    OUT_FOR_DELIVERY:"#e67e22",
    DELIVERED:       "#22c55e",
    CANCELLED:       "#eb4d4b",
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: "8rem 1rem", textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>Loading your orders…</p>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: "8rem 1rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", letterSpacing: "4px", marginBottom: "2rem" }}>PLEASE SIGN IN</h1>
          <Link href="/login" className="btn btn-primary">SIGN IN NOW</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
        {/* Back link */}
        <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", fontSize: "0.875rem", marginBottom: "2.5rem" }}>
          <FiArrowLeft size={14} /> Back to Profile
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
          <FiPackage size={28} />
          <h1 style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "4px" }}>MY ORDERS</h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <FiShoppingBag size={48} color="var(--muted)" style={{ marginBottom: "1.5rem" }} />
            <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>You haven't placed any orders yet.</p>
            <Link href="/shop" className="btn btn-primary">START SHOPPING</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                style={{
                  display: "block",
                  padding: "1.5rem 2rem",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  backgroundColor: "white",
                }}
                className="order-list-card"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "2px", marginBottom: "0.25rem" }}>ORDER ID</p>
                    <p style={{ fontWeight: "700", fontSize: "0.9375rem" }}>#{order.id.slice(-10).toUpperCase()}</p>
                  </div>
                  <span style={{
                    display: "inline-block",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    padding: "0.3rem 0.75rem",
                    background: statusColor[order.status] || "#888",
                    color: "white",
                    letterSpacing: "1px",
                    borderRadius: "2px",
                  }}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "0.875rem", color: "var(--muted)" }}>
                  <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span style={{ fontWeight: "600", color: "var(--foreground)" }}>₹{order.totalAmount}</span>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                  Payment: {order.paymentMethod} · {order.paymentStatus}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .order-list-card:hover {
          border-color: var(--foreground);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </>
  );
}
