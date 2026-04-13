"use client";

import { useState, useEffect } from "react";
import { FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Orders Management</h1>
            <p style={{ color: 'var(--muted)' }}>Manage and track customer shipments</p>
          </div>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <FiSearch color="var(--muted)" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '250px' }}
            />
          </div>
        </header>

        <div className="admin-card-grid" style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#eef2ff', padding: '1rem', borderRadius: '8px' }}><FiClock color="#4f46e5" /></div>
            <div><p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pending</p><h3 style={{ fontSize: '1.5rem' }}>{orders.filter(o => o.status === 'PROCESSING').length}</h3></div>
          </div>
          <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '8px' }}><FiTruck color="#f97316" /></div>
            <div><p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Shipped</p><h3 style={{ fontSize: '1.5rem' }}>{orders.filter(o => o.status === 'SHIPPED').length}</h3></div>
          </div>
          <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px' }}><FiCheckCircle color="#16a34a" /></div>
            <div><p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Delivered</p><h3 style={{ fontSize: '1.5rem' }}>{orders.filter(o => o.status === 'DELIVERED').length}</h3></div>
          </div>
          <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px' }}><FiShoppingBag color="#dc2626" /></div>
            <div><p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Revenue</p><h3 style={{ fontSize: '1.5rem' }}>₹{orders.filter(o => o.paymentStatus === 'COMPLETED').reduce((acc, o) => acc + o.totalAmount, 0)}</h3></div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)' }}>ORDER ID</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)' }}>CUSTOMER</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)' }}>DATE</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)' }}>AMOUNT</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)' }}>STATUS</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>No orders found.</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>#{order.id.slice(-8).toUpperCase()}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>{order.user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{order.user.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600' }}>₹{order.totalAmount}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        backgroundColor: order.status === 'DELIVERED' ? '#f0fdf4' : order.status === 'SHIPPED' ? '#fff7ed' : '#eef2ff',
                        color: order.status === 'DELIVERED' ? '#16a34a' : order.status === 'SHIPPED' ? '#f97316' : '#4f46e5'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <select 
                        defaultValue={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}
