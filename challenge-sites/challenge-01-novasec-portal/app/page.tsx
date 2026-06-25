export default function HomePage() {
  return (
    <>
      {/* Our servers know things this page never will. */}

      <section className="hero">
        <div className="hero-content">
          <span className="badge">✦ CGS CTF 2026 Challenge</span>
          <h1>Securing Tomorrow, Today</h1>
          <p>
            NovaSec Labs delivers next-generation cybersecurity intelligence
            trusted by Fortune 500 enterprises across the globe.
          </p>
          <button className="btn-glow" onClick={(e) => e.preventDefault()}>
            Request Demo
          </button>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <span className="icon">🛡️</span>
              <h3>Threat Intelligence</h3>
              <p>
                Real-time threat monitoring and predictive analytics powered by
                machine learning algorithms deployed across 47 global data centers.
              </p>
            </div>
            <div className="service-card">
              <span className="icon">🔍</span>
              <h3>Penetration Testing</h3>
              <p>
                Comprehensive security assessments covering network, application,
                and social engineering attack vectors with detailed remediation.
              </p>
            </div>
            <div className="service-card">
              <span className="icon">⚖️</span>
              <h3>Compliance & Governance</h3>
              <p>
                Full-spectrum compliance automation for SOC 2, ISO 27001, HIPAA,
                and GDPR regulatory frameworks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="transparency">
        <div className="container">
          <h2>Source Transparency</h2>
          <p className="subtitle">Our commitment to open development.</p>

          <div className="code-window">
            <div className="code-header">
              <span className="dot r"></span>
              <span className="dot y"></span>
              <span className="dot g"></span>
              <span>index.html</span>
            </div>
            <pre>{`<span class="comment">&lt;!-- NovaSec Portal v3.1.0 --&gt;</span>
<span class="tag">&lt;meta</span> <span class="attr">name</span>=<span class="string">"security-policy"</span> <span class="attr">content</span>=<span class="string">"strict"</span><span class="tag">&gt;</span>
<span class="tag">&lt;meta</span> <span class="attr">name</span>=<span class="string">"build-id"</span> <span class="attr">content</span>=<span class="string">"ns-20240312-a4f2"</span><span class="tag">&gt;</span>
<span class="tag">&lt;meta</span> <span class="attr">name</span>=<span class="string">"deploy-env"</span> <span class="attr">content</span>=<span class="string">"production"</span><span class="tag">&gt;</span>
<span class="tag">&lt;link</span> <span class="attr">rel</span>=<span class="string">"stylesheet"</span> <span class="attr">href</span>=<span class="string">"/assets/global.css"</span><span class="tag">&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="string">"/js/analytics.min.js"</span><span class="tag">&gt;&lt;/script&gt;</span>
<span class="comment">&lt;!-- No sensitive data stored client-side --&gt;</span>

<span class="tag">&lt;div</span> <span class="attr">class</span>=<span class="string">"hero-section"</span><span class="tag">&gt;</span>
  <span class="tag">&lt;h1&gt;</span>Securing Tomorrow, Today<span class="tag">&lt;/h1&gt;</span>
  <span class="tag">&lt;p&gt;</span>Next-generation cybersecurity intelligence.<span class="tag">&lt;/p&gt;</span>
<span class="tag">&lt;/div&gt;</span>`}</pre>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="social">
            <span>𝕏</span>
            <span>🔗</span>
            <span>💬</span>
            <span>📧</span>
          </div>
          <p>© 2026 NovaSec Labs, Inc. — Powered by NovaSec SecureStack™</p>
          <p style={{ marginTop: 8, color: '#475569' }}>All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
