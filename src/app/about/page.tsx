import Header from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', letterSpacing: '8px', textAlign: 'center', marginBottom: '4rem' }}>ABOUT US</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--foreground)', fontWeight: 300 }}>
            <p>
              Founded in 2026, NIZO started with a simple goal: providing comfortable and stylish clothing for everyone. We believe in quality products that look good and feel great.
            </p>
            
            <div style={{ height: '400px', backgroundColor: 'var(--secondary)', backgroundImage: "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2670&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', margin: '2rem 0' }}></div>
            
            <p>
              Our goal is to provide a wide range of clothing that fits your lifestyle. We focus on durable materials and practical designs that you can wear every day.
            </p>
            
            <p>
              At NIZO, we are committed to customer satisfaction and quality service. Our collections are regularly updated to bring you the best in casual and formal wear.
            </p>
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
