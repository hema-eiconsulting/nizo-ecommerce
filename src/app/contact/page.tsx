import Header from "@/components/layout/Header";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h1 style={{ fontSize: '3rem', letterSpacing: '8px', marginBottom: '1.5rem' }}>CONTACT US</h1>
            <p style={{ color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>We are here to help you with any questions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div>
                <h3 style={{ fontSize: '0.75rem', letterSpacing: '3px', color: 'var(--muted)', marginBottom: '1.5rem' }}>MOBILE</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.25rem' }}>
                  <FiPhone />
                  <a href="tel:8939521181">+91 8939521181</a>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.75rem', letterSpacing: '3px', color: 'var(--muted)', marginBottom: '1.5rem' }}>EMAIL</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.25rem' }}>
                  <FiMail />
                  <a href="mailto:concierge@nizo.com">concierge@nizo.com</a>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.75rem', letterSpacing: '3px', color: 'var(--muted)', marginBottom: '1.5rem' }}>OFFICE ADDRESS</h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '1.25rem' }}>
                  <FiMapPin style={{ marginTop: '0.25rem' }} />
                  <p>12th Avenue, Main Road<br />Chennai, India</p>
                </div>
              </div>
            </div>

            {/* Placeholder Form */}
            <div style={{ backgroundColor: 'white', padding: '3rem', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', letterSpacing: '2px', marginBottom: '2rem' }}>SEND A MESSAGE</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input type="text" placeholder="NAME" style={{ padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', width: '100%', outline: 'none' }} />
                <input type="email" placeholder="EMAIL" style={{ padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', width: '100%', outline: 'none' }} />
                <textarea placeholder="MESSAGE" rows={4} style={{ padding: '1rem', border: 'none', borderBottom: '1px solid var(--border)', width: '100%', outline: 'none', resize: 'none' }}></textarea>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>SEND MESSAGE</button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <footer style={{ padding: '8rem 0 4rem', backgroundColor: 'var(--secondary)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ marginBottom: '3rem', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '5px' }}>NIZO</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.65rem', letterSpacing: '1px' }}>© 2026 NIZO CLOTHING STORE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </>
  );
}
