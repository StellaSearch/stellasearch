import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./Menu.css";

const GITHUB = "https://github.com/StellaSearch/stellasearch";

type Section = "about" | "credits" | null;

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggle = () => {
    setSection(null);
    setOpen((o) => !o);
  };

  const pick = (s: Exclude<Section, null>) =>
    setSection((cur) => (cur === s ? null : s));
  
  return createPortal(
    <>
      <button
        type="button"
        className={`menu-btn${open ? " is-open" : ""}`}
        aria-label={open ? "close menu" : "open menu"}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={toggle}
      >
        <span />
        <span />
        <span />
      </button>
      <div
        className={`menu-scrim${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <nav
        id="site-menu"
        className={`menu-panel${open ? " is-open" : ""}`}
        aria-label="site"
      >
        <ul>
          <li>
            <button
              type="button"
              aria-expanded={section === "about"}
              onClick={() => pick("about")}
            >
              about
            </button>
            {section === "about" && (
              <p>
                Pick a place and a date.
                <br />
                <br />
                StellaSearch ranks constellations
                by how high and how long they sit in a dark sky.
              </p>
            )}
          </li>

          <li>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              github
            </a>
          </li>

          <li>
            <button
              type="button"
              aria-expanded={section === "credits"}
              onClick={() => pick("credits")}
            >
              credits
            </button>
            {section === "credits" && (
              <p>
                Star positions: Hipparcos catalogue (ESA), via VizieR.
                <br />
                Ephemeris: Skyfield.
                <br />
                Built at HackPrinceton.
              </p>
            )}
          </li>
        </ul>
      </nav>
    </>,
    document.body
  );
}
