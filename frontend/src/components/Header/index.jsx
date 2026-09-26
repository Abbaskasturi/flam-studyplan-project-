import { BookOpen } from "lucide-react";
import "./index.css";

function Header() {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <span className="site-header__icon" aria-hidden="true">
          <BookOpen size={22} />
        </span>
        <div>
          <h1 className="site-header__title">StudyFlow AI</h1>
          <p className="site-header__subtitle">
            Turn any topic into an interactive study session.
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
