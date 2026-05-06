"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";

// All possible statuses in order
const ORDER_STEPS = [
  { key: "PROCESSING",       label: "Processing",        description: "Your order has been received and is being prepared." },
  { key: "CONFIRMED",        label: "Confirmed",         description: "Your order has been confirmed." },
  { key: "READY_TO_SHIP",    label: "Ready to Ship",     description: "Your order is packed and ready for pickup." },
  { key: "SHIPPED",          label: "Shipped",           description: "Your order is on its way." },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",  description: "Your order is out for delivery today." },
  { key: "DELIVERED",        label: "Delivered",         description: "Your order has been delivered. Enjoy!" },
];

const CANCELLED_STEP = { key: "CANCELLED", label: "Cancelled", description: "This order has been cancelled." };

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(r => r.json())
        .then(data => {
          if (data.order) setOrder(data.order);
          else setError(data.message || "Order not found.");
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load order.");
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, orderId]);

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: "8rem 1rem", textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>Loading order…</p>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: "8rem 1rem", textAlign: "center" }}>
          <Link href="/login" className="btn btn-primary">SIGN IN TO VIEW</Link>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: "8rem 1rem", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>{error || "Order not found."}</p>
          <Link href="/orders" className="btn btn-primary">BACK TO ORDERS</Link>
        </div>
      </>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const steps = isCancelled ? ORDER_STEPS : ORDER_STEPS;
  const currentIndex = isCancelled
    ? -1
    : ORDER_STEPS.findIndex(s => s.key === order.status);

  return (
    <>
      <Header />
      <div className="container" style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
        {/* Back */}
        <Link href="/orders" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", fontSize: "0.875rem", marginBottom: "2.5rem" }}>
          <FiArrowLeft size={14} /> All Orders
        </Link>

        {/* Order header */}
        <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "2px", marginBottom: "0.5rem" }}>ORDER</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
            #{order.id.slice(-10).toUpperCase()}
          </h1>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--muted)" }}>
            <span>Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>Payment: {order.paymentMethod} · {order.paymentStatus}</span>
            <span style={{ fontWeight: "700", color: "var(--foreground)", fontSize: "1rem" }}>Total: ₹{order.totalAmount}</span>
          </div>
          {order.shippingAddress && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--muted)" }}>
              📍 {order.shippingAddress}
            </p>
          )}
        </div>

        {/* ── STATUS TRACKER ── */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "0.8rem", letterSpacing: "3px", color: "var(--muted)", marginBottom: "2rem" }}>ORDER STATUS</h2>

          {isCancelled ? (
            // Cancelled state
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem 2rem", border: "2px solid #eb4d4b", background: "#fff8f8" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#eb4d4b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FiX size={22} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "0.25rem" }}>Order Cancelled</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{CANCELLED_STEP.description}</p>
              </div>
            </div>
          ) : (
            // Progress tracker
            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div style={{
                position: "absolute",
                left: "21px",
                top: "22px",
                bottom: "22px",
                width: "2px",
                background: "var(--border)",
                zIndex: 0
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx < currentIndex;
                  const isActive = idx === currentIndex;
                  const isPending = idx > currentIndex;

                  return (
                    <div key={step.key} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", position: "relative", zIndex: 1, paddingBottom: idx < ORDER_STEPS.length - 1 ? "2rem" : "0" }}>
                      {/* Circle */}
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isDone ? "#22c55e" : isActive ? "var(--button-bg)" : "white",
                        border: isPending ? "2px solid var(--border)" : "none",
                        transition: "all 0.3s ease",
                        boxShadow: isActive ? "0 0 0 4px rgba(176,137,104,0.2)" : "none"
                      }}>
                        {isDone ? (
                          <FiCheck size={20} color="white" strokeWidth={2.5} />
                        ) : isActive ? (
                          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "white" }} />
                        ) : (
                          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--border)" }} />
                        )}
                      </div>

                      {/* Text */}
                      <div style={{ paddingTop: "0.6rem" }}>
                        <p style={{
                          fontWeight: isActive || isDone ? "700" : "400",
                          fontSize: isActive ? "1rem" : "0.9rem",
                          color: isPending ? "var(--muted)" : "var(--foreground)",
                          marginBottom: "0.2rem",
                          letterSpacing: "0.5px"
                        }}>
                          {step.label}
                        </p>
                        {(isActive || isDone) && (
                          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: "1.5" }}>
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── ORDER ITEMS ── */}
        <div>
          <h2 style={{ fontSize: "0.8rem", letterSpacing: "3px", color: "var(--muted)", marginBottom: "1.5rem" }}>ITEMS IN THIS ORDER</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {order.items?.map((item: any) => (
              <div key={item.id} style={{ display: "flex", gap: "1.25rem", alignItems: "center", padding: "1.25rem", border: "1px solid var(--border)", background: "white" }}>
                {item.product?.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    style={{ width: "70px", height: "88px", objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "600", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.product?.name}</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Size: {item.size} &nbsp;·&nbsp; Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: "700", fontSize: "0.9375rem" }}>₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
