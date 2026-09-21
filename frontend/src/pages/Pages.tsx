import { ArrowRight, CheckCircle2, Gauge, LockKeyhole, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

function ShieldIcon() {
  return (
    <span className="capability-icon">
      <LockKeyhole size={20} />
    </span>
  );
}

export function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand">
          <span>CI</span>
          <div>
            <strong>CustomerIQ</strong>
            <small>Intelligence platform</small>
          </div>
        </div>
        <div className="landing-links">
          <a href="#capabilities">Capabilities</a>
          <a href="#method">Methodology</a>
          <Link to="/dashboard" className="button primary">
            Open workspace <ArrowRight size={15} />
          </Link>
        </div>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Customer intelligence, clarified</span>
          <h1>
            Turn customer signals into <em>retention momentum.</em>
          </h1>
          <p>
            CustomerIQ brings churn analytics, segmentation, and revenue-at-risk into one focused operating view for modern customer teams.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="button primary">
              Explore the workspace <ArrowRight size={16} />
            </Link>
            <a href="#capabilities" className="button quiet">
              See how it works
            </a>
          </div>
          <div className="hero-proof">
            <span>
              <CheckCircle2 size={15} /> Decision-ready insights
            </span>
            <span>
              <CheckCircle2 size={15} /> Explainable by design
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-top">
            <span>Portfolio health</span>
            <span className="live-dot">Live connected</span>
          </div>
          <div className="hero-number">
            93.2<small>% retained</small>
          </div>
          <div className="mini-chart">
            <div style={{ height: "34%" }} />
            <div style={{ height: "48%" }} />
            <div style={{ height: "43%" }} />
            <div style={{ height: "64%" }} />
            <div style={{ height: "58%" }} />
            <div style={{ height: "83%" }} />
            <div style={{ height: "76%" }} />
            <div style={{ height: "96%" }} />
          </div>
          <div className="visual-bottom">
            <span>Retention trajectory</span>
            <strong>
              +1.2% <TrendingUp size={14} />
            </strong>
          </div>
        </div>
      </section>
      <section className="landing-capabilities" id="capabilities">
        <span className="eyebrow">One operating picture</span>
        <h2>From signal to action, without the noise.</h2>
        <div className="capability-grid">
          <article>
            <ShieldIcon />
            <h3>See risk earlier</h3>
            <p>Surface the customers and behaviors that deserve attention before renewal is at stake.</p>
          </article>
          <article>
            <Gauge size={22} />
            <h3>Prioritize value</h3>
            <p>Connect retention decisions to customer value and revenue exposure, not just a score.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <h3>Move with context</h3>
            <p>Give every recommendation a transparent reason and a next-best action for the team.</p>
          </article>
        </div>
      </section>
    </div>
  );
}