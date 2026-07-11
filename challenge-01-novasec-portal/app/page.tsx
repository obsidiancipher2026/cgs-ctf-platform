export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <h1 className="hero-title">Securing Tomorrow, Today.</h1>
          <p className="hero-tagline">
            Enterprise-grade cybersecurity intelligence. <br />
            Proactive defense against tomorrow&apos;s threats.
          </p>
          <button className="hero-cta" onClick={(e) => e.preventDefault()}>
            Explore Our Platform
          </button>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">&#9889;</div>
              <h3>Threat Intelligence</h3>
              <p>Real-time threat feeds, dark web monitoring, and predictive analytics powered by machine learning.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">&#128737;</div>
              <h3>Penetration Testing</h3>
              <p>Comprehensive red-team assessments covering web, mobile, cloud, and social engineering vectors.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">&#9878;</div>
              <h3>Compliance</h3>
              <p>Achieve and maintain compliance with SOC 2, ISO 27001, HIPAA, and GDPR frameworks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOURCE TRANSPARENCY */}
      <section className="transparency" id="transparency">
        <div className="container">
          <h2 className="section-title">Source Transparency</h2>
          <p className="transparency-subtitle">Our commitment to open development.</p>
          <div className="code-block">
            <div className="code-header">
              <span className="code-dot code-dot-red" />
              <span className="code-dot code-dot-yellow" />
              <span className="code-dot code-dot-green" />
              <span className="code-label">index.html</span>
            </div>
            <pre className="code-body">{`<!-- NovaSec Portal v3.1.0 -->
<meta name="security-policy" content="strict">
<meta name="build-id" content="ns-20240312-a4f2">

<div class="hero">
  <h1>Securing Tomorrow, Today.</h1>
  <p>Enterprise-grade protection.</p>
</div>

<footer>
  <p>&copy; 2026 NovaSec Labs. All rights reserved.</p>
</footer>

<!-- No sensitive data stored client-side -->`}</pre>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <strong>NovaSec Labs</strong>
            <span className="footer-tag">Powered by NovaSec SecureStack&trade;</span>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">&#120143;</a>
            <a href="#" aria-label="GitHub">&#9421;</a>
            <a href="#" aria-label="LinkedIn">&#11960;</a>
          </div>
          <p className="footer-copy">&copy; 2026 NovaSec Labs, Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* Nudge comment */}
      <!-- Our servers know things this page never will. -->
    </>
  )
}
