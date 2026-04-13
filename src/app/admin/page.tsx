export default function AdminDashboard() {
  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
        <p style={{ color: 'var(--muted)' }}>Welcome back, Admin.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="admin-card">
          <h3 style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: '600', marginTop: '0.5rem' }}>₹0</p>
        </div>
        <div className="admin-card">
          <h3 style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Active Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: '600', marginTop: '0.5rem' }}>0</p>
        </div>
        <div className="admin-card">
          <h3 style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Products Sold</h3>
          <p style={{ fontSize: '2rem', fontWeight: '600', marginTop: '0.5rem' }}>0</p>
        </div>
      </div>
    </div>
  );
}
