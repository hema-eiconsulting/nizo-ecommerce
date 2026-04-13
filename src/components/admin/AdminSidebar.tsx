import Link from "next/link";
import { FiHome, FiBox, FiShoppingCart, FiUsers } from "react-icons/fi";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <h2>NIZO Admin</h2>
      </div>
      <nav className="admin-nav">
        <Link href="/admin" className="nav-item">
          <FiHome /> Dashboard
        </Link>
        <Link href="/admin/products" className="nav-item">
          <FiBox /> Products
        </Link>
        <Link href="/admin/orders" className="nav-item">
          <FiShoppingCart /> Orders
        </Link>
        <Link href="/admin/customers" className="nav-item">
          <FiUsers /> Customers
        </Link>
      </nav>
    </aside>
  );
}
