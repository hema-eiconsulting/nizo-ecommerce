"use client";

import { useSession, signOut } from "next-auth/react";
import Header from "@/components/layout/Header";
import { FiUser, FiPackage, FiLogOut, FiSettings } from "react-icons/fi";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="container" style={{ padding: '5rem' }}>Loading profile...</div>;

  if (!session) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 1rem' }}>
         <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>PLEASE SIGN IN</h1>
         <p style={{ color: 'var(--muted)', marginBottom: '3rem' }}>You need to be logged in to view your profile.</p>
         <Link href="/login" className="btn btn-primary">SIGN IN NOW</Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '10rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FiUser size={32} />
          </div>
          <h1>{session.user?.name || "Customer"}</h1>
          <p style={{ color: 'var(--muted)' }}>{session.user?.email}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
           <Link href="/orders" className="admin-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2.5rem' }}>
              <FiPackage size={24} />
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>MY ORDERS</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Track your shipments and view history.</p>
              </div>
           </Link>

           <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2.5rem' }}>
              <FiSettings size={24} />
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>ACCOUNT SETTINGS</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Update your password and address.</p>
              </div>
           </div>

           <button 
             onClick={() => signOut({ callbackUrl: '/' })}
             className="admin-card" 
             style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2.5rem', backgroundColor: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
           >
              <FiLogOut size={24} color="var(--danger)" />
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--danger)' }}>SIGN OUT</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Log out from your NIZO account.</p>
              </div>
           </button>
        </div>
      </div>
    </>
  );
}
