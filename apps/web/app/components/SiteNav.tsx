import Link from "next/link";
import Logo from "./Logo";

export default function SiteNav() {
  return (
    <header className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-brand">
          <Logo size={30} />
          <span>Statuscope</span>
        </Link>
        <nav className="nav-links">
          <a href="/#product">Product</a>
          <a href="/#connectors">Connectors</a>
          <a href="/#features">Features</a>
          <a href="/#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <Link href="/signin" className="btn btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn btn-primary">Sign up</Link>
        </div>
      </div>
    </header>
  );
}
