import React, { useState } from "react";
import UnifiedViz from "../unified-three-pillars.jsx";
import CarbonPools from "../pillar1-carbon-pools.jsx";
import EconomicsViz from "../pillar2-economics.jsx";
import WaterViz from "../pillar3-water-security.jsx";

const SECTIONS = [
  { id: "overview", label: "Overview", sub: "", component: UnifiedViz },
  { id: "carbon", label: "Carbon", sub: "Pillar 1", component: CarbonPools },
  { id: "economics", label: "Economics", sub: "Pillar 2", component: EconomicsViz },
  { id: "water", label: "Water", sub: "Pillar 3", component: WaterViz },
];

class RenderGuard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown render error",
    };
  }

  componentDidCatch(error, info) {
    console.error("TCU Stats section render failed", error, info);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sectionKey !== this.props.sectionKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "calc(100vh - 72px)",
            display: "grid",
            placeItems: "center",
            padding: "48px 24px",
            background: "linear-gradient(180deg, #18190f 0%, #111108 100%)",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              borderRadius: 18,
              padding: "28px 26px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(192,57,43,0.35)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: 42,
                color: "#ffffff",
                lineHeight: 0.95,
                marginBottom: 12,
              }}
            >
              This section failed to render
            </div>
            <p style={{ color: "#d0d3d4", fontSize: 15, lineHeight: 1.7, margin: "0 0 12px" }}>
              The page did not load correctly, but the site shell is still running so you are not left on a blank screen.
            </p>
            <p style={{ color: "#aab0b4", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
              Switch to another section or check the browser console before publishing again.
            </p>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(192,57,43,0.12)",
                border: "1px solid rgba(192,57,43,0.2)",
                color: "#f0d3cd",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Error: {this.state.message}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [active, setActive] = useState("overview");
  const ActiveComponent = SECTIONS.find((s) => s.id === active).component;
  const navButtonMinHeight = 52;

  return (
    <div style={{ minHeight: "100vh", background: "#111108" }}>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 220,
          background: "rgba(10,11,8,0.97)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(106,157,42,0.35)",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "8px 18px",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: 18,
            borderRight: "1px solid rgba(106,157,42,0.28)",
            marginRight: 8,
            flexShrink: 0,
          }}
        >
          <a
            href="https://thecarbonunderground.org/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit The Carbon Underground"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 2px",
              minHeight: navButtonMinHeight,
              borderRadius: 0,
              background: "transparent",
              border: "none",
            }}
          >
            <img
              src="/TCU.Whitetext.GreenBGjpg.webp"
              alt="The Carbon Underground"
              style={{ height: 44, width: "auto", display: "block" }}
            />
          </a>
        </div>

        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActive(section.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "8px 12px 7px",
              background: active === section.id ? "rgba(106,157,42,0.14)" : "rgba(255,255,255,0.02)",
              border:
                active === section.id
                  ? "1px solid rgba(106,157,42,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: 102,
              minHeight: navButtonMinHeight,
              boxSizing: "border-box",
            }}
          >
            {section.sub ? (
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: active === section.id ? "#88b850" : "#9a9d9f",
                  lineHeight: 1,
                  marginBottom: 3,
                  transition: "color 0.2s",
                }}
              >
                {section.sub}
              </span>
            ) : null}
            <span
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: 24,
                letterSpacing: 0.5,
                color: active === section.id ? "#ffffff" : "#d0d3d4",
                lineHeight: 1,
                transition: "color 0.2s",
              }}
            >
              {section.label}
            </span>
          </button>
        ))}

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            fontSize: 11,
            color: "#a4a8aa",
            letterSpacing: 1.2,
            flexShrink: 0,
            paddingLeft: 12,
            padding: "6px 10px",
            borderRadius: 14,
            background: "linear-gradient(180deg, #edf3df 0%, #e3edcf 100%)",
            border: "1px solid rgba(139,189,83,0.28)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.16)",
          }}
        >
          <a
            href="https://www.theedisoninstitute.org/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit The Edison Institute"
            style={{ display: "inline-flex" }}
          >
            <img
              src="/TEILogo.webp"
              alt="The Edison Institute"
              style={{
                height: 28,
                width: "auto",
                opacity: 1,
                display: "block",
              }}
            />
          </a>
        </div>
      </nav>

      <RenderGuard sectionKey={active}>
        <ActiveComponent />
      </RenderGuard>
    </div>
  );
}
