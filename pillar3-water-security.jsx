import { useState, useEffect, useRef, useMemo } from "react";

/* â"€â"€â"€ Color palette â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const C = {
  bg:         "#f5f4ee",   // main background — warm off-white
  card:       "#ffffff",   // card surface
  cardAlt:    "#eeecea",   // slightly tinted card
  cardGreen:  "#edf5db",   // green-tinted card
  cardRed:    "#fdf0ee",   // red-tinted card
  text:       "#1a1a12",   // primary text
  textSec:    "#4c4c3c",   // secondary text
  textMuted:  "#7a7a6a",   // muted / labels
  textFaint:  "#aeada4",   // very faint
  border:     "rgba(0,0,0,0.08)",
  borderGreen:"rgba(106,157,42,0.35)",
  borderRed:  "rgba(192,57,43,0.3)",
  green:      "#5a8c1e",   // slightly deeper green for light bg readability
  greenBright:"#6a9d2a",
  red:        "#c0392b",
  redBright:  "#e74c3c",
};

/* â"€â"€â"€ Global styles â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
  @keyframes fadeTabIn3 {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function InjectCSS() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

/* â"€â"€â"€ ScrollProgressBar â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function ScrollProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: "rgba(0,0,0,0.06)" }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${C.green}, ${C.greenBright}, #8dc53a)`,
        transition: "width 0.1s linear",
        boxShadow: `0 0 8px ${C.greenBright}55`,
      }} />
    </div>
  );
}

/* â"€â"€â"€ AnimatedNumber â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function AnimatedNumber({ target, duration = 1400, prefix = "", suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const s = performance.now();
        const go = (now) => {
          const p = Math.min((now - s) / duration, 1);
          setVal((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(go);
        };
        requestAnimationFrame(go);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return (
    <span ref={ref}>
      {prefix}{val.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
}

/* â"€â"€â"€ FadeIn â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function FadeIn({ children, delay = 0, style }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
    return (
      <div ref={ref} style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}>
        {children}
      </div>
    );
  }

/* â"€â"€â"€ TabTransition â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function TabTransition({ tabKey, children }) {
  return (
    <div key={tabKey} style={{ animation: "fadeTabIn3 0.4s ease forwards" }}>
      {children}
    </div>
  );
}

function IconBadge({
  icon,
  size = 18,
  bg = "transparent",
  border = "none",
  padding = 0,
  radius = 999,
  color = C.text,
}) {
  if (typeof icon === "string" && icon.startsWith("/")) {
    return (
      <div style={{
        width: size + padding * 2,
        height: size + padding * 2,
        borderRadius: radius,
        background: bg,
        border,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <img
          src={icon}
          alt=""
          style={{ width: size, height: size, objectFit: "contain", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: size + padding * 2,
      height: size + padding * 2,
      borderRadius: radius,
      background: bg,
      border,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size,
      color,
      flexShrink: 0,
      lineHeight: 1,
    }}>
      {icon}
    </div>
  );
}

/* â"€â"€â"€ TabIntro â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function TabIntro({ icon, headline, sub, accent = C.green }) {
  const isRed = accent === C.red;
  return (
    <FadeIn>
      <div style={{
        padding: "18px 22px 18px",
        background: isRed
          ? "linear-gradient(135deg, rgba(192,57,43,0.05) 0%, rgba(245,244,238,0.96) 46%, rgba(252,240,238,0.84) 100%)"
          : "linear-gradient(135deg, rgba(106,157,42,0.06) 0%, rgba(245,244,238,0.96) 46%, rgba(237,245,219,0.8) 100%)",
        borderRadius: 16,
        border: `1px solid ${isRed ? "rgba(192,57,43,0.18)" : "rgba(106,157,42,0.22)"}`,
        borderTop: `3px solid ${isRed ? "rgba(192,57,43,0.28)" : "rgba(106,157,42,0.32)"}`,
        marginBottom: 28,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "start",
        gap: 16,
        boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
      }}>
        <IconBadge
          icon={icon}
          size={18}
          padding={9}
          bg={isRed ? "rgba(192,57,43,0.08)" : "rgba(106,157,42,0.1)"}
          border={`1px solid ${isRed ? "rgba(192,57,43,0.18)" : "rgba(106,157,42,0.22)"}`}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: accent,
            fontSize: 9,
            letterSpacing: 2.1,
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 10,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, flexShrink: 0 }} />
            Climate Connection
            <span style={{ height: 1, flex: 1, background: isRed ? "rgba(192,57,43,0.22)" : "rgba(106,157,42,0.26)" }} />
          </div>
          <div style={{
            fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
            fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.35,
          }}>{headline}</div>
          <div style={{ fontSize: 13, color: "#5f6257", lineHeight: 1.68, maxWidth: 780 }}>{sub}</div>
        </div>
      </div>
    </FadeIn>
  );
}

/* â"€â"€â"€ SectionHeader â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function SectionHeader({ title, accent = C.green }) {
  return (
    <div style={{
      display: "inline-block",
      background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
      padding: "8px 20px",
      marginBottom: 16,
      borderRadius: "2px 8px 8px 2px",
    }}>
      <h2 style={{
        fontFamily: "'Bebas Neue', Arial, sans-serif",
        fontSize: 22, letterSpacing: 2, color: "#ffffff", margin: 0, fontWeight: 400,
      }}>{title}</h2>
    </div>
  );
}

/* â"€â"€â"€ StatCard â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function StatCard({ value, sub, label, color = C.green, watermark = "", delay = 0 }) {
  const [hov, setHov] = useState(false);
  const isRed = color === C.red;
  return (
    <FadeIn delay={delay} style={{ height: "100%" }}>
      <div
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            padding: "22px 18px",
            height: "100%",
            background: hov
              ? (isRed ? "#fce9e7" : "#eef6dd")
              : C.card,
            borderRadius: 12,
            border: `1px solid ${hov ? color : C.border}`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            cursor: "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s ease, border 0.25s ease",
            boxShadow: hov ? `0 4px 20px ${color}22` : "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
        {watermark && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: 64, color: color, opacity: hov ? 0.06 : 0.025,
            pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
            transition: "opacity 0.3s ease",
          }}>{watermark}</div>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hov ? 1 : 0.25,
          transition: "opacity 0.3s ease",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "clamp(28px, 3.5vw, 44px)",
            color: color, lineHeight: 1, marginBottom: 2,
          }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: color, opacity: 0.8, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>{sub}</div>}
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{label}</div>
        </div>
      </div>
    </FadeIn>
  );
}

/* â"€â"€â"€ InsightBox â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function InsightBox({ title, children, accent = C.green, icon = "💡" }) {
  const isRed = accent === C.red;
  return (
    <FadeIn>
      <div style={{
        padding: "22px 22px",
        background: isRed ? C.cardRed : C.cardGreen,
        borderRadius: 12,
        border: `1px solid ${isRed ? C.borderRed : C.borderGreen}`,
        borderLeft: `4px solid ${accent}`,
        marginTop: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <IconBadge
            icon={icon}
            size={16}
            padding={8}
            bg={isRed ? "rgba(192,57,43,0.08)" : "rgba(106,157,42,0.12)"}
            border={`1px solid ${isRed ? C.borderRed : C.borderGreen}`}
          />
          <span style={{ fontSize: 14, fontWeight: 700, color: accent }}>{title}</span>
        </div>
        <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.75 }}>{children}</div>
      </div>
    </FadeIn>
  );
}

/* â"€â"€â"€ InfiltrationBar â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function InfiltrationBar({ rank, practice, gain, color, delay = 0 }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 20px",
      background: C.card,
      borderRadius: 12,
      marginBottom: 10,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 14,
        color: "#ffffff", flexShrink: 0,
      }}>{rank}</div>
      <span style={{
        fontSize: 13, fontWeight: 600, color: C.text,
        width: 160, flexShrink: 0,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      }}>{practice}</span>
      <div style={{ flex: 1, background: C.cardAlt, borderRadius: 4, height: 24, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: vis ? `${gain}%` : "0%",
          background: `linear-gradient(90deg, ${color}55, ${color})`,
          borderRadius: 4,
          transition: `width 1.3s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
          display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
        }}>
          {vis && gain > 20 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
              +{gain}%
            </span>
          )}
        </div>
      </div>
      <span style={{
        fontFamily: "'Bebas Neue', Arial, sans-serif",
        fontSize: 28, color: color, width: 64, textAlign: "right", flexShrink: 0,
      }}>+{gain}%</span>
    </div>
  );
}

/* â"€â"€â"€ AquiferChart â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function AquiferChart({ data, yLabel, color, title, subtitle }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const W = 360, H = 206, PL = 52, PR = 20, PT = 18, PB = 36;
  const pw = W - PL - PR, ph = H - PT - PB;
  const vals = data.map(d => d.level !== undefined ? d.level : d.feet);
  const minY = Math.min(...vals);
  const minX = data[0].year, maxX = data[data.length - 1].year;
  const endVal = vals[vals.length - 1];
  const midY = minY / 2;
  const fmt = (n) => (Math.abs(n % 1) < 0.001 ? `${Math.round(n)}` : n.toFixed(1));

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const xS = yr => PL + ((yr - minX) / (maxX - minX)) * pw;
  const yS = v  => PT + ((v - 0) / (minY - 0)) * ph;
  const lineD = data.map((d, i) => `${i === 0 ? "M" : "L"}${xS(d.year).toFixed(1)},${yS(vals[i]).toFixed(1)}`).join(" ");
  const areaD = lineD + ` L${xS(maxX).toFixed(1)},${yS(0).toFixed(1)} L${xS(minX).toFixed(1)},${yS(0).toFixed(1)} Z`;
  const gradId = `aqgrad-${title.replace(/\s/g, "")}`;
  const tickYears = data.filter((_, i) => i % 2 === 0).map(d => d.year);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{
            fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
            fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2,
          }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.textMuted }}>{subtitle}</div>}
        </div>
        <div style={{
          textAlign: "right",
          background: `${color}12`,
          border: `1px solid ${color}44`,
          borderRadius: 8,
          padding: "5px 9px 4px",
          minWidth: 78,
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: 28,
            lineHeight: 0.9,
            color,
          }}>
            {fmt(endVal)} ft
          </div>
          <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>net change</div>
        </div>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={PL} x2={W - PR} y1={yS(0)} y2={yS(0)} stroke="rgba(0,0,0,0.14)" strokeWidth={1} />
        <line x1={PL} x2={W - PR} y1={yS(midY)} y2={yS(midY)} stroke="rgba(0,0,0,0.09)" strokeWidth={1} strokeDasharray="3,5" />
        <line x1={PL} x2={W - PR} y1={yS(minY)} y2={yS(minY)} stroke={color} strokeWidth={0.8} strokeDasharray="3,5" strokeOpacity={0.35} />
        <text x={PL - 7} y={yS(0) + 4} textAnchor="end" fill={C.textMuted} fontSize={10} fontFamily="Inter,Arial,sans-serif">0 ft</text>
        <text x={PL - 7} y={yS(midY) + 4} textAnchor="end" fill={C.textMuted} fontSize={10} fontFamily="Inter,Arial,sans-serif">{fmt(midY)} ft</text>
        <text x={PL - 7} y={yS(minY) + 4} textAnchor="end" fill={color} fontSize={10} fontWeight={700} fontFamily="Inter,Arial,sans-serif">{fmt(minY)} ft</text>
        {tickYears.map((year) => (
          <text key={year} x={xS(year)} y={H - 8} textAnchor="middle" fill={C.textMuted} fontSize={10} fontFamily="Inter,Arial,sans-serif">{year}</text>
        ))}
        {!tickYears.includes(maxX) && (
          <text x={xS(maxX)} y={H - 8} textAnchor="middle" fill={C.textMuted} fontSize={10} fontFamily="Inter,Arial,sans-serif">{maxX}</text>
        )}
        <path d={areaD} fill={`url(#${gradId})`} opacity={vis ? 1 : 0} style={{ transition: "opacity 1.2s ease" }} />
        <path d={lineD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={700} strokeDashoffset={vis ? 0 : 700}
          style={{ transition: "stroke-dashoffset 2.2s ease" }}
        />
        {vis && (
          <g>
            <line x1={xS(maxX)} x2={xS(maxX)} y1={yS(0)} y2={yS(endVal)} stroke={color} strokeDasharray="3,4" strokeOpacity={0.3} />
            <circle cx={xS(maxX)} cy={yS(vals[vals.length - 1])} r={5} fill={color} />
            <circle cx={xS(maxX)} cy={yS(vals[vals.length - 1])} r={9} fill={color} opacity={0.2} />
          </g>
        )}
      </svg>
      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, fontStyle: "italic" }}>{yLabel}</div>
    </div>
  );
}

function EvidenceFigure({ src, label, title, caption, height = 220, position = "center center" }) {
  return (
    <FadeIn>
      <div style={{
        background: C.card,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
        height: "100%",
      }}>
        <div style={{
          height,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: position,
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
          }} />
          <div style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 12,
          }}>
            <div style={{
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.74)",
              fontWeight: 700,
            }}>
              {label}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{caption}</div>
        </div>
      </div>
    </FadeIn>
  );
}

/* â"€â"€â"€ WaterDropFill â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function WaterDropFill({ percent, label, sublabel, color = C.green, size = 100 }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const id = `drop-${label.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div ref={ref} style={{ textAlign: "center", minWidth: 90, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox="0 0 60 80" width={size} height={size * 1.33}>
        <defs>
          <clipPath id={id}>
            <path d="M30 4 C30 4 4 34 4 50 C4 65.5 15.8 76 30 76 C44.2 76 56 65.5 56 50 C56 34 30 4 30 4Z" />
          </clipPath>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M30 4 C30 4 4 34 4 50 C4 65.5 15.8 76 30 76 C44.2 76 56 65.5 56 50 C56 34 30 4 30 4Z"
          fill="rgba(0,0,0,0.04)" stroke={color} strokeWidth={1.5} strokeOpacity={0.4} />
        <rect clipPath={`url(#${id})`} x={0} width={60}
          y={vis ? 80 - (percent / 100) * 76 : 80} height={76}
          fill={`url(#${id}-g)`}
          style={{ transition: "y 1.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        {vis && (
          <text x={30} y={54} textAnchor="middle" fill="#ffffff" fontSize={13}
            fontFamily="'Bebas Neue', Arial, sans-serif" fontWeight={700}>
            {percent}%
          </text>
        )}
      </svg>
      <div style={{
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        fontSize: 12, fontWeight: 700, color: C.text, marginTop: 10,
        lineHeight: 1.3,
      }}>{label}</div>
      {sublabel && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 1.35, maxWidth: 120 }}>{sublabel}</div>}
    </div>
  );
}

/* â"€â"€â"€ FallowingMeter â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function FallowingMeter() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const minRetiredPct = 5;
  const maxRetiredPct = 10;
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ marginTop: 2 }}>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 8,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
          Central Valley farmland retirement by 2040
        </span>
        <span style={{ fontSize: 12, color: C.redBright, fontWeight: 700, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
          5-10% of total farmland
        </span>
      </div>
      <div style={{
        position: "relative",
        paddingTop: 18,
        marginBottom: 6,
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: `${(minRetiredPct + maxRetiredPct) / 2}%`,
          transform: "translateX(-50%)",
          padding: "2px 8px 3px",
          borderRadius: 999,
          background: "linear-gradient(180deg, #fff6f3 0%, #fff1ed 100%)",
          border: `1px solid ${C.borderRed}`,
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.1,
          color: C.red,
          lineHeight: 1,
          whiteSpace: "nowrap",
          boxShadow: "0 1px 4px rgba(192,57,43,0.08)",
          opacity: vis ? 1 : 0,
          transition: "opacity 0.3s ease 0.5s",
        }}>
          500K-1M acres
        </div>
        <div style={{
        position: "relative",
        height: 16,
        background: C.cardAlt,
        borderRadius: 999,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: vis ? `${maxRetiredPct}%` : "0%",
          background: `linear-gradient(90deg, ${C.red}cc, ${C.redBright})`,
          borderRadius: 999,
          transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
          minWidth: vis ? 58 : 0,
        }} />
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: vis ? `${minRetiredPct}%` : "0%",
          background: `linear-gradient(90deg, ${C.red}, ${C.red}dd)`,
          borderRadius: 999,
          transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
        }} />
        <div style={{
          position: "absolute",
          top: -4,
          left: `${maxRetiredPct}%`,
          width: 2,
          height: 22,
          background: C.redBright,
          opacity: 0.85,
        }}>
        </div>
      </div>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 10,
        color: C.textMuted,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        marginBottom: 2,
      }}>
        <span>0 acres</span>
        <span>10M acres total</span>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 11,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      }}>
        <span style={{ color: C.red, fontWeight: 700 }}>500K minimum</span>
        <span style={{ color: C.redBright, fontWeight: 700 }}>1M upper projection</span>
      </div>
    </div>
  );
}

/* ─── DepletionRaceBar ─────────────────────────────────────────────────────────────────────────────────────────────── */
function DepletionRaceBar() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const rows = [
    { label: "Natural recharge",   pct: 2,   val: "~0.024 in/yr", isHigh: false },
    { label: "Ogallala depletion", pct: 100, val: "up to 3 ft/yr", isHigh: true  },
  ];
  return (
    <div ref={ref} style={{ padding: "24px 24px 20px", background: C.card, borderRadius: 14, border: `1px solid ${C.borderRed}`, marginBottom: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.redBright, marginBottom: 6, fontWeight: 600 }}>
        The Fatal Imbalance — Recharge vs. Depletion
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
        Ogallala Aquifer: natural recharge rate vs. current pumping rate (proportional)
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: r.isHigh ? C.red : C.green }}>{r.label}</span>
          <div style={{ height: 32, background: C.cardAlt, borderRadius: 7, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%", width: vis ? `${r.pct}%` : "0%",
              background: r.isHigh ? `linear-gradient(90deg, ${C.red}cc, ${C.redBright})` : C.green,
              borderRadius: 7,
              transition: `width ${1.2 + i * 0.5}s cubic-bezier(0.22,1,0.36,1)`,
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
            }}>
              {vis && r.isHigh && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{r.val}</span>
              )}
            </div>
            {!r.isHigh && vis && (
              <span style={{ position: "absolute", left: `${r.pct + 2}%`, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.textMuted }}>
                {r.val}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 22, textAlign: "right", color: r.isHigh ? C.red : C.green }}>
            {r.isHigh ? "×50+" : "×1"}
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 8, padding: "10px 14px",
        background: `${C.red}0e`, borderRadius: 8, border: `1px solid ${C.borderRed}`,
        fontSize: 13, color: C.red, fontWeight: 700, textAlign: "center",
      }}>
        Being emptied 3—50× faster than natural recharge — the deficit is permanent
      </div>
    </div>
  );
}

/* ─── ScarcityTimeline ─────────────────────────────────────────────────────────────────────────────────────────────── */
function ScarcityTimeline() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const milestones = [
    { year: 2016, pct: 50, label: "4B face severe scarcity ≥1 month/yr",  color: "#8dc53a" },
    { year: 2022, pct: 65, label: "71% of 1,693 aquifer systems declining", color: "#d4a017" },
    { year: 2024, pct: 80, label: "71% of global aquifers in net decline",  color: "#e67e22" },
    { year: 2050, pct: 95, label: "5B people at risk (WMO projection)",      color: "#c0392b" },
  ];
  return (
    <div ref={ref} style={{ padding: "26px 24px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 6, fontWeight: 600 }}>
        Global Water Stress — Deterioration Timeline
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>
        Verified benchmarks: people, aquifers, projections
      </div>
      {milestones.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr 160px", gap: 14, alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 16, color: C.textMuted, textAlign: "right" }}>{m.year}</div>
          <div style={{ height: 28, background: C.cardAlt, borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: vis ? `${m.pct}%` : "0%",
              background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
              borderRadius: 6,
              transition: `width ${1.0 + i * 0.25}s cubic-bezier(0.22,1,0.36,1) ${i * 120}ms`,
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
            }}>
              {vis && (
                <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 14, color: "#fff" }}>{m.pct}%</span>
              )}
            </div>
          </div>
          <div style={{ fontSize: 12, color: m.color, fontWeight: m.year === 2050 ? 700 : 500 }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── SOMWaterBars ─────────────────────────────────────────────────────────────────────────────────────────────── */
function SOMWaterBars() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.25 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const rows = [
    { som: "1% SOM", gal: 20000, pct: 25, label: "Typical degraded cropland",        isDim: true  },
    { som: "2% SOM", gal: 40000, pct: 50, label: "+20,000 gal — manageable drought",  isDim: false },
    { som: "4% SOM", gal: 80000, pct: 100, label: "+60,000 gal — 2× drought resilience", isDim: false },
  ];
  return (
    <div ref={ref} style={{ marginTop: 24, padding: "26px 24px", background: C.card, borderRadius: 14, border: `1px solid ${C.borderGreen}` }}>
      <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 6, fontWeight: 600 }}>
        Soil Organic Matter — Water Holding Capacity
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Hudson 1994: gallons of plant-available water per acre</div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr) 132px", gap: 12, alignItems: "center", minHeight: 48, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 17, color: row.isDim ? C.textMuted : C.green, textAlign: "right" }}>
              {row.som}
            </div>
            <div style={{ height: 32, background: C.cardAlt, borderRadius: 7, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: vis ? `${row.pct}%` : "0%",
              background: row.isDim
                ? `linear-gradient(90deg, ${C.textMuted}44, ${C.textMuted}77)`
                : `linear-gradient(90deg, ${C.green}88, ${C.green})`,
              borderRadius: 7,
              transition: `width ${1.1 + i * 0.3}s cubic-bezier(0.22,1,0.36,1) ${i * 150}ms`,
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
            }}>
              <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 13, color: row.isDim ? C.textSec : "#fff", whiteSpace: "nowrap" }}>
                {row.gal.toLocaleString()} gal
              </span>
            </div>
          </div>
            <div style={{ textAlign: "right", minHeight: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 18, color: row.isDim ? C.textMuted : C.green }}>
                {row.isDim ? "baseline" : `+${((row.pct - 25) / 25 * 100).toFixed(0)}%`}
              </div>
              <div style={{ fontSize: 10, color: C.textFaint, lineHeight: 1.35, minHeight: 26 }}>{row.label}</div>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ─── DemandGapChart ─────────────────────────────────────────────────────────────────────────────────────────────── */
function DemandGapChart() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const demand = [
    { year: "2000", pct: 64, indexed: 100, base: true },
    { year: "2025", pct: 74, indexed: 115 },
    { year: "2050", pct: 100, indexed: 156 },
  ];
  const supply = [
    { year: "2000", pct: 100, indexed: 100, base: true },
    { year: "2025", pct: 83,  indexed: 83  },
    { year: "2050", pct: 62,  indexed: 62  },
  ];
  return (
    <div ref={ref} style={{ padding: "26px 24px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.redBright, marginBottom: 6, fontWeight: 600 }}>
        The Widening Gap — Food Demand vs. Freshwater Supply
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>
        Indexed to 2000 baseline (100) — the scissors effect driving global crisis
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          Food calories needed (rising ↑)
        </div>
        {demand.map((d, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr 52px", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 15, color: C.textMuted, textAlign: "right" }}>{d.year}</div>
            <div style={{ height: 28, background: C.cardAlt, borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: vis ? `${d.pct}%` : "0%",
                background: d.base ? `linear-gradient(90deg, ${C.green}88, ${C.green})` : `linear-gradient(90deg, ${C.red}77, ${C.red})`,
                borderRadius: 6,
                transition: `width ${1.1 + i * 0.2}s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`,
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
              }}>
                {vis && <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 13, color: "#fff" }}>{d.indexed}</span>}
              </div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 18, color: d.base ? C.green : C.red, textAlign: "right" }}>
              {d.base ? "" : `+${d.indexed - 100}`}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 20, marginBottom: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          Freshwater per capita (falling ↓)
        </div>
        {supply.map((d, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr 52px", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 15, color: C.textMuted, textAlign: "right" }}>{d.year}</div>
            <div style={{ height: 28, background: C.cardAlt, borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: vis ? `${d.pct}%` : "0%",
                background: d.base ? `linear-gradient(90deg, ${C.green}88, ${C.green})` : `linear-gradient(90deg, ${C.red}55, ${C.red}88)`,
                borderRadius: 6,
                transition: `width ${1.1 + i * 0.2}s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`,
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
              }}>
                {vis && <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 13, color: "#fff" }}>{d.indexed}</span>}
              </div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 18, color: d.base ? C.green : C.red, textAlign: "right" }}>
              {d.base ? "" : `${d.indexed - 100}`}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: `${C.red}0e`, borderRadius: 8, border: `1px solid ${C.borderRed}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, color: C.textSec }}>2050 gap between food demand and freshwater availability</span>
        <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 28, color: C.red }}>94 pts</span>
      </div>
    </div>
  );
}

/* ─── AquiferHotspots ─────────────────────────────────────────────────────────────────────────────────────────────── */
function AquiferHotspots() {
  const spots = [
    { name: "Arabian Aquifer",       region: "Middle East",      risk: "critical", dep: "depleted", pop: "200M+ dependent",   pct: 95 },
    { name: "Ogallala Aquifer",      region: "US Great Plains",  risk: "critical", dep: "-16.5 ft avg", pop: "6,000 yr recharge", pct: 88 },
    { name: "Indus Basin",           region: "India / Pakistan", risk: "critical", dep: "fastest in Asia", pop: "300M dependent",  pct: 82 },
    { name: "North China Plain",     region: "China",            risk: "high",     dep: "severe overdraft", pop: "400M+ dependent", pct: 68 },
    { name: "Central Valley, CA",    region: "United States",    risk: "high",     dep: "-7.2 ft / decade", pop: "SGMA mandated",   pct: 62 },
  ];
  const riskColor = { critical: C.red, high: "#e67e22" };
  return (
    <FadeIn>
      <div style={{ padding: "24px 24px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 6, fontWeight: 600 }}>
          Critical Aquifer Hotspots — Global Risk Map
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
          The world's most stressed groundwater systems, ranked by depletion severity
        </div>
        {spots.map((s, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "20px 1fr 90px",
            gap: 12, alignItems: "center",
            padding: "12px 0",
            borderBottom: i < spots.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: riskColor[s.risk],
              boxShadow: `0 0 6px ${riskColor[s.risk]}88`,
              flexShrink: 0,
            }} />
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}</span>
                <span style={{ fontSize: 10, color: C.textFaint, letterSpacing: 0.8 }}>{s.region}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, color: riskColor[s.risk], fontWeight: 600 }}>{s.dep}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{s.pop}</span>
              </div>
            </div>
            <div style={{ height: 6, background: C.cardAlt, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${s.pct}%`,
                background: `linear-gradient(90deg, ${riskColor[s.risk]}88, ${riskColor[s.risk]})`,
                borderRadius: 3,
              }} />
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

/* â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const OGALLALA = [
  { year: 1950, level: 0 }, { year: 1960, level: -2.5 }, { year: 1970, level: -5.5 },
  { year: 1980, level: -9 }, { year: 1990, level: -11 }, { year: 2000, level: -13 },
  { year: 2010, level: -14.8 }, { year: 2019, level: -16.5 },
];
const CV_SUB = [
  { year: 2015, feet: 0 }, { year: 2017, feet: -1.8 }, { year: 2019, feet: -3.2 },
  { year: 2021, feet: -5.1 }, { year: 2023, feet: -6.4 }, { year: 2025, feet: -7.2 },
];
const INFILTRATION = [
  { practice: "Perennial systems", gain: 60, color: "#3a7010" },
  { practice: "Cover crops",       gain: 35, color: "#4d8a1a" },
  { practice: "No-till",           gain: 45, color: "#6a9d2a" },
];
const FACT_STRIP_ITEMS = [
  { label: "20,000 gal/acre", sub: "per 1% SOM gain" },
  { label: "71% aquifers", sub: "declining globally" },
  { label: "87% CA loss", sub: "water by 2043" },
  { label: "500K-1M acres", sub: "projected retired" },
  { label: "16x infiltration", sub: "Gabe Brown ranch" },
];

/* â"€â"€â"€ Main Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
export default function WaterViz() {
  const [activeTab, setActiveTab] = useState("retention");
  const tabRef = useRef(null);

  const tabs = useMemo(() => [
    { id: "retention", label: "Soil & Water", desc: "Living soil reservoir" },
    { id: "aquifers",  label: "Aquifer Crisis", desc: "Underground depletion" },
    { id: "valley",    label: "Central Valley", desc: "US food bowl at risk" },
    { id: "sgma",      label: "SGMA & Fallowing", desc: "Mandated contraction" },
    { id: "global",    label: "Global Scarcity", desc: "Planetary water stress" },
  ], []);

  const handleTab = (id) => {
    setActiveTab(id);
    tabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      padding: "0 0 80px",
    }}>
      <InjectCSS />
      <ScrollProgressBar />

      {/* â"€â"€ Hero â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div style={{ position: "relative", minHeight: 400, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/leaf-water-closeup.webp)",
          backgroundSize: "cover", backgroundPosition: "center 40%",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(14,15,10,0.82) 0%, rgba(14,15,10,0.62) 36%, rgba(14,15,10,0.32) 70%, rgba(14,15,10,0.18) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, rgba(14,15,10,0) 0%, rgba(14,15,10,0.75) 60%, ${C.bg} 100%)`,
        }} />

        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 34% 38%, rgba(38,52,15,0.16) 0%, rgba(38,52,15,0.08) 24%, rgba(38,52,15,0) 52%)",
        }} />

        <header style={{ position: "relative", zIndex: 1, padding: "64px 32px 44px", maxWidth: 920, margin: "0 auto" }}>
          <div style={{ maxWidth: 660 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
            color: "#6a9d2a", marginBottom: 18,
            padding: "5px 14px", border: "1px solid rgba(106,157,42,0.4)", borderRadius: 4,
            background: "rgba(106,157,42,0.08)",
          }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6a9d2a" }} />
            Pillar 3 - The Carbon Underground
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "clamp(44px, 6vw, 82px)",
            lineHeight: 0.95, margin: 0,
            color: "#ffffff",
            textShadow: "0 2px 40px rgba(0,0,0,0.9)",
            letterSpacing: 0.5,
          }}>
            Climate Change<br />
            <span style={{ color: "#6a9d2a" }}>Looks Like Water Loss</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15.5, lineHeight: 1.75, marginTop: 20, maxWidth: 560 }}>
            Climate change is a water crisis. Healthy soil holds <strong style={{ color: "#dce7cb" }}>thousands more gallons per acre</strong> while hotter air, weaker snowpack, and deeper aquifer drawdown push farm systems toward collapse.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            marginTop: 24,
            maxWidth: 700,
          }}>
            {[
              { title: "Healthy soil", stat: "20K GAL", statLabel: "per 1% SOM gain", accent: "#6a9d2a" },
              { title: "CA water loss", stat: "-87%", statLabel: "by 2043", accent: "#e74c3c" },
              { title: "Projected fallowing", stat: "500K-1M AC", statLabel: "retired acreage", accent: "#e74c3c" },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "11px 12px 10px",
                  borderRadius: 12,
                  background: "rgba(14,15,10,0.32)",
                  backdropFilter: "blur(6px)",
                  border: `1px solid ${item.accent}33`,
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{
                  fontSize: 10,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: item.accent,
                  fontWeight: 700,
                  marginBottom: 2,
                  textShadow: "0 1px 10px rgba(0,0,0,0.22)",
                }}>
                  {item.title}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: item.stat.length > 8 ? 24 : 30,
                    lineHeight: 0.92,
                    color: "#ffffff",
                    marginBottom: 1,
                  }}>
                    {item.stat}
                  </div>
                  <div style={{
                    fontSize: 10.5,
                    lineHeight: 1.35,
                    color: item.accent,
                    letterSpacing: 0.7,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    textShadow: "0 1px 10px rgba(0,0,0,0.22)",
                  }}>
                    {item.statLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </header>
      </div>

      {/* â"€â"€ Facts Strip â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div style={{
        background: "linear-gradient(90deg, #1f3205 0%, #2f5202 50%, #1f3205 100%)",
        borderTop: "1px solid rgba(106,157,42,0.2)",
        borderBottom: "1px solid rgba(106,157,42,0.25)",
      }}>
        <div style={{
          maxWidth: 1020, margin: "0 auto", padding: "8px 22px",
          display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
        }}>
          {FACT_STRIP_ITEMS.map((item, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              border: "1px solid rgba(106,157,42,0.25)",
              borderRadius: 999, padding: "4px 10px",
              background: "rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 13, letterSpacing: 0.8, color: "#e3ecd2" }}>{item.label}</span>
              <span style={{ fontSize: 10, color: "rgba(233,240,219,0.72)" }}>{item.sub}</span>
            </span>
          ))}
        </div>
      </div>

      <div ref={tabRef} style={{
        position: "sticky", top: 64, zIndex: 100,
        background: "rgba(245,244,238,0.97)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <nav style={{
          maxWidth: 1020, margin: "0 auto", padding: "10px 28px",
          display: "flex", gap: 10, overflowX: "auto",
        }}>
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => handleTab(t.id)} style={{
                padding: "9px 12px 8px",
                minWidth: 160,
                textAlign: "left",
                background: active ? "#eaf0dd" : "rgba(255,255,255,0.75)",
                border: active ? "1px solid rgba(106,157,42,0.45)" : "1px solid rgba(0,0,0,0.08)",
                borderBottom: active ? "3px solid #5a8c1e" : "1px solid rgba(0,0,0,0.08)",
                borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', Arial, sans-serif",
                  fontSize: 24,
                  lineHeight: 1,
                  letterSpacing: 0.4,
                  color: active ? "#1a1a12" : "#3f423c",
                  marginBottom: 2,
                }}>
                  {t.label}
                </div>
                <div style={{
                  fontSize: 10,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: active ? "#4b6f1d" : "#7a7a6a",
                }}>
                  {t.desc}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <main style={{ maxWidth: 1020, margin: "0 auto", padding: "26px 28px 0" }}>

        {/* â•â• TAB: Soil & Water â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "retention" && (
          <TabTransition tabKey="retention">
            <TabIntro
              icon="/icons/waterdrop.webp"
              headline="Healthy soil functions like a water reservoir"
              sub="Each gain in soil organic matter helps land take in rainfall, hold it longer, and release it more steadily. That buffering becomes more valuable as storms grow sharper and drought lasts longer."
              accent={C.green}
            />

            <FadeIn>
              <div style={{
                padding: "32px 28px",
                background: C.cardGreen,
                borderRadius: 16,
                border: `1px solid ${C.borderGreen}`,
                marginBottom: 32,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 28, alignItems: "center",
              }}>
                <div style={{ textAlign: "center", minWidth: 130 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(44px, 5.5vw, 72px)",
                    color: C.green, lineHeight: 1,
                  }}>
                    <AnimatedNumber target={20000} />
                  </div>
                  <div style={{ fontSize: 11, color: C.green, marginTop: 4, letterSpacing: 1, opacity: 0.75 }}>gallons / acre</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 8 }}>
                    Every 1% increase in soil organic matter
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10 }}>
                    20,000 additional gallons of water held per acre
                  </div>
                  <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.7 }}>
                    USDA-NRCS figure for total water held. Plant-available water: 3,400—10,000 gal/acre.
                    Hudson 1994: soil with <strong style={{ color: C.text }}>4% SOM holds 2× the water</strong> of soil with 1% SOM.
                    In drought conditions, this difference is survival vs. crop failure.
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <SectionHeader title="Infiltration Rate Improvement" />
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 18, lineHeight: 1.6 }}>
                Percentage increase vs. conventional tillage systems. Source: Basche &amp; DeLonge 2019, meta-analysis of 89 field studies.
              </p>
              {INFILTRATION.map((inf, i) => (
                <InfiltrationBar key={inf.practice} rank={i + 1} practice={inf.practice}
                  gain={inf.gain} color={inf.color} delay={i * 160} />
              ))}
            </FadeIn>

            <FadeIn delay={160}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 28 }}>
                <StatCard value="94%" label="Erosion reduction from cover crops vs. bare soil" color={C.green} watermark="94" delay={0} />
                <StatCard value="90%" label="Runoff reduction in best-case cover crop studies" color={C.green} watermark="90" delay={80} />
                <StatCard value="70%" label="Soil loss reduction from ground cover (85 studies)" color={C.green} watermark="70" delay={160} />
              </div>
            </FadeIn>

            {/* SOM water holding comparison */}
            <FadeIn delay={180}>
              <SOMWaterBars />
            </FadeIn>

            {/* Gabe Brown case study */}
            <FadeIn delay={200}>
              <div style={{
                marginTop: 24, padding: "26px 24px",
                background: C.cardGreen, borderRadius: 14,
                border: `1px solid ${C.borderGreen}`,
                display: "grid", gridTemplateColumns: "1fr auto 1fr",
                gap: 20, alignItems: "center",
              }}>
                <div style={{
                  padding: "18px 16px", background: C.card,
                  borderRadius: 10, textAlign: "center",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
                    Before (conventional)
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 44, color: C.textMuted, lineHeight: 1 }}>0.5</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>inches/hr infiltration</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: C.green, fontSize: 22, marginBottom: 4 }}>↑</div>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: 24, color: C.green,
                    background: `${C.green}18`, borderRadius: 6, padding: "4px 10px",
                  }}>16×</div>
                </div>
                <div style={{
                  padding: "18px 16px",
                  background: C.card,
                  borderRadius: 10, textAlign: "center",
                  border: `1px solid ${C.borderGreen}`,
                }}>
                  <div style={{ fontSize: 11, color: C.green, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
                    After · Gabe Brown, ND
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 44, color: C.green, lineHeight: 1 }}>8</div>
                  <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>inches/hr infiltration</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.textSec, marginTop: 14, lineHeight: 1.6, textAlign: "center" }}>
                16× improvement over 20 years of regenerative transition. <strong style={{ color: C.text }}>No irrigation required.</strong> North Dakota prairie restored.
              </div>
            </FadeIn>

            <InsightBox title="The Compounding Benefit" icon="/icons/plant.webp" accent={C.green}>
              Increasing soil organic matter by just 1% across 100 million acres of US cropland would store
              an additional <strong style={{ color: C.text }}>2 trillion gallons of water annually</strong> —
              the equivalent of filling 3 million Olympic swimming pools. This is climate adaptation at continental scale, built acre by acre through biology that already exists.
            </InsightBox>
          </TabTransition>
        )}

        {/* â•â• TAB: Aquifer Crisis â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "aquifers" && (
          <TabTransition tabKey="aquifers">
            <TabIntro
              icon="/icons/siren.webp"
              headline="Aquifers are being drained faster than they can recover"
              sub="Water stored over centuries is being pulled down in a matter of decades. Hotter growing conditions raise demand just as weaker snowpack and slower recharge leave less water to replace it."
              accent={C.red}
            />

            <div style={{
              height: 180, borderRadius: 14, overflow: "hidden",
              backgroundImage: "url('/Owens%20Lake.webp')",
              backgroundSize: "cover", backgroundPosition: "center 58%",
              position: "relative", marginBottom: 20,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, rgba(192,57,43,0.45) 0%, rgba(0,0,0,0.15) 100%)",
              }} />
              <div style={{
                position: "absolute", bottom: 16, left: 20,
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: 13, letterSpacing: 2, color: "rgba(255,255,255,0.75)",
              }}>OWENS LAKE PLAYA - A VISUAL PROXY FOR PERMANENT WATER LOSS</div>
            </div>

            <FadeIn>
              <DepletionRaceBar />
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18, marginBottom: 22 }}>
              <EvidenceFigure
                src="/sir20235143_fig01.webp"
                label="USGS SIR 2023-5143"
                title="Ogallala depletion is now a mapped groundwater reality"
                caption="The requested High Plains aquifer figure gives this section a more authoritative visual anchor than a purely abstract chart."
              />
              <EvidenceFigure
                src="/sanjoaquin_sar_2016254.webp"
                label="NASA / InSAR"
                title="The Central Valley is visible from space as a subsidence bowl"
                caption="This satellite-derived view makes the California problem tangible: aquifer decline is physically deforming the landscape and infrastructure."
              />
            </div>

            <FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 28 }}>
                <div style={{
                  background: C.card, borderRadius: 14, padding: "22px 18px",
                  border: `1px solid ${C.borderGreen}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <AquiferChart
                    data={OGALLALA}
                    title="Ogallala Aquifer Decline"
                    subtitle="Area-weighted average, 1950—2019"
                    yLabel="Source: USGS 2024"
                    color={C.green}
                  />
                </div>
                <div style={{
                  background: C.card, borderRadius: 14, padding: "22px 18px",
                  border: `1px solid ${C.borderRed}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <AquiferChart
                    data={CV_SUB}
                    title="Central Valley Land Subsidence"
                    subtitle="Tule subbasin, 2015—2025"
                    yLabel="Source: Stanford 2024"
                    color={C.red}
                  />
                </div>
              </div>
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 24 }}>
              <StatCard value="286M" sub="acre-feet" label="Ogallala water lost since ~1950" color={C.green} watermark="286M" delay={0} />
              <StatCard value="6,000+" sub="years" label="To naturally replenish at current recharge rates" color={C.red} watermark="6K" delay={80} />
              <StatCard value="28 ft" sub="total" label="Central Valley max land subsidence since 1920s" color={C.red} watermark="28" delay={160} />
              <StatCard value="60%" sub="reduced" label="Friant-Kern Canal capacity lost from subsidence" color={C.red} watermark="60" delay={0} />
              <StatCard value="2M ac-ft" sub="/year" label="Central Valley annual groundwater overdraft (PPIC)" color={C.red} watermark="2M" delay={80} />
              <StatCard value="−1.52 ft" sub="in 2024" label="Kansas aquifer decline Jan 2024—Jan 2025 (USGS)" color={C.red} watermark="−1.52" delay={160} />
            </div>

            <InsightBox title="California State Water Project Warning (May 2025)" icon="/icons/warning.webp" accent={C.red}>
              Without action, State Water Project deliveries could decline{" "}
              <strong style={{ color: C.text }}>87%</strong> by 2043 — from 2.2 million acre-feet to just
              295,000. Permanent aquifer storage loss from clay compaction equals the volume of Lake Mead.
              This storage is <strong style={{ color: C.red }}>gone forever</strong>.
              No amount of rain recovers it.
            </InsightBox>
          </TabTransition>
        )}

        {/* â•â• TAB: Central Valley â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "valley" && (
          <TabTransition tabKey="valley">
            <div style={{
              height: 200, borderRadius: 14, overflow: "hidden",
              backgroundImage: "url(/L8-07052024_Crop_revise.webp)",
              backgroundSize: "cover", backgroundPosition: "center center",
              position: "relative", marginBottom: 20,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to right, rgba(14,15,10,0.6) 0%, rgba(14,15,10,0.1) 60%, rgba(14,15,10,0.0) 100%)",
              }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 22px" }}>
                <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 28, color: "#fff", letterSpacing: 0.5, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
                  California's Central Valley
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Patchwork cropland, canals, and a shrinking groundwater buffer
                </div>
              </div>
            </div>
            <TabIntro
              icon="/icons/wheat.webp"
              headline="The Central Valley is reaching a water turning point"
              sub="This region grows an outsized share of US food, but it depends on a water system under growing strain. Warming, shrinking snowpack, and chronic overdraft are now reinforcing one another - and when that system weakens, food risk travels far beyond the Valley."
              accent={C.red}
            />

            <FadeIn>
              <div style={{
                padding: "24px 24px",
                background: C.cardGreen,
                borderRadius: 14, border: `1px solid ${C.borderGreen}`, marginBottom: 24,
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 16, fontWeight: 600 }}>
                  California's Central Valley — America's Food Bowl
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
                  {[
                    { val: "1%",  label: "of US farmland",         icon: "/icons/map.webp", sub: "1% land, outsized output" },
                    { val: "25%", label: "of US food supply",       icon: "/icons/grain.webp", sub: "1 in 4 plates" },
                    { val: "40%", label: "of all US fruits & nuts", icon: "/icons/orange.webp", sub: "almonds, pistachios, grapes" },
                    { val: "$50B",label: "agricultural industry",   icon: "/icons/financial.webp", sub: "annual economic output" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      textAlign: "center", padding: "18px 10px 14px",
                      background: C.card, borderRadius: 10,
                      border: `1px solid ${C.border}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                        <IconBadge
                          icon={s.icon}
                          size={18}
                          padding={7}
                          bg="rgba(106,157,42,0.1)"
                          border={`1px solid ${C.borderGreen}`}
                        />
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(22px, 2.5vw, 36px)", color: C.text, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: C.textFaint, lineHeight: 1.3 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65, marginTop: 16 }}>
                  When this water buffer fails, the consequence is not only regional farm stress. It is a direct
                  threat to the reliability and affordability of food far downstream from California.
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <div style={{
                padding: "28px 24px", background: C.cardRed, borderRadius: 14,
                border: `1px solid ${C.borderRed}`, marginBottom: 18,
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.redBright, marginBottom: 10, fontWeight: 600 }}>
                  Kern County Wine Grape Collapse · 2023—2024
                </div>
                <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 22, color: C.text, marginBottom: 20, letterSpacing: 1 }}>
                  One Year. One Crop. −80% Revenue.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "center" }}>
                  <div style={{ padding: "18px 16px", background: C.card, borderRadius: 10, textAlign: "center", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, letterSpacing: 1 }}>2023 REVENUE</div>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 44, color: C.textMuted, lineHeight: 1 }}>$132M</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: C.red, fontSize: 22 }}>↑</div>
                    <div style={{
                      fontFamily: "'Bebas Neue', Arial, sans-serif",
                      fontSize: 32, color: C.red,
                      background: `${C.red}14`, borderRadius: 6, padding: "2px 10px",
                    }}>−80%</div>
                  </div>
                  <div style={{ padding: "18px 16px", background: C.card, borderRadius: 10, textAlign: "center", border: `1px solid ${C.borderRed}` }}>
                    <div style={{ fontSize: 11, color: C.redBright, marginBottom: 8, letterSpacing: 1 }}>2024 REVENUE</div>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 44, color: C.red, lineHeight: 1 }}>$27M</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65, marginTop: 18 }}>
                  Simultaneously, <strong style={{ color: C.text }}>17,000 acres</strong> of Kern County farmland were permanently removed
                  from production in 2024 alone under SGMA mandates - the first forced fallowing at industrial scale in US history.
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={130}>
              <div style={{
                padding: "24px 22px", background: C.card, borderRadius: 12,
                border: `1px solid ${C.borderRed}`, marginBottom: 18,
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.redBright, marginBottom: 10, fontWeight: 600 }}>
                  Tulare Lake Returns · 2023
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 56, color: C.red, lineHeight: 1 }}>111K</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>acres inundated</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                      California's largest historical lake refilled in weeks. $900M—$2B in crop losses.
                    </div>
                    <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>
                      Drained in the 1800s for farming, Tulare Lake refilled in 2023 when climate-intensified rains overwhelmed
                      subsidence-damaged drainage infrastructure - revealing the cost of building agriculture on
                      degraded soil that cannot absorb water.
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 18 }}>
              <FadeIn delay={180}>
                <div style={{
                  padding: "24px 20px", background: C.cardRed,
                  borderRadius: 12, border: `1px solid ${C.borderRed}`,
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.redBright, marginBottom: 10, fontWeight: 600 }}>
                    Land Value Destruction
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 60, color: C.red, lineHeight: 1, marginBottom: 8 }}>
                    −75%
                  </div>
                  <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.65 }}>
                    Farmland values in fallowing zones have dropped up to 75%. Farmers face a compound crisis:
                    no water rights, no crop income, and collapsing asset values.
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={220}>
                <div style={{
                  padding: "24px 20px", background: C.card,
                  borderRadius: 12, border: `1px solid ${C.borderGreen}`,
                  height: "100%", boxSizing: "border-box",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.green, marginBottom: 10, fontWeight: 600 }}>
                    The Almond Paradox
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 22, color: C.textMuted }}>640K ac</div>
                      <div style={{ fontSize: 10, color: C.textFaint }}>2004</div>
                    </div>
                    <div style={{ flex: 1, height: 3, background: `linear-gradient(90deg, ${C.textFaint}, ${C.red})`, borderRadius: 2 }} />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 22, color: C.red }}>1,640K ac</div>
                      <div style={{ fontSize: 10, color: C.textFaint }}>2021</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>
                    +156% planted acres while water supplies shrink.
                    Almonds consume 4.7—5.5M acre-feet/yr.
                    <strong style={{ color: C.text }}> 12 liters of water per single almond.</strong>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 18 }}>
              <EvidenceFigure
                src="/canal-subsidence-inspection.webp"
                label="USGS FIELD PHOTO"
                title="Ground-truth evidence: damaged canals and subsiding infrastructure"
                caption="The requested aqueduct and inspection imagery works best here, where the story shifts from regional scale to visible system failure inside the Central Valley water network."
                height={240}
              />
              <EvidenceFigure
                src="/jpegPIA16293.webp"
                label="NASA JPL"
                title="Satellite subsidence imagery reinforces the same warning from above"
                caption="Pairing field photography with JPL's subsidence image turns this section from a narrative claim into a layered evidence sequence."
                height={240}
              />
            </div>

            <InsightBox title="Friant-Kern Canal — Infrastructure Failure at Scale" icon="/icons/construction.webp" accent={C.red}>
              Phase 1 of the Friant-Kern Canal subsidence repair:{" "}
              <strong style={{ color: C.text }}>$325 million for just 10 miles</strong> of canal —
              74% over budget. The canal lost 60% of its delivery capacity from land that sank as farmers
              pumped aquifers dry beneath it. Every foot of subsidence is irreversible.
            </InsightBox>
          </TabTransition>
        )}

        {/* â•â• TAB: SGMA & Fallowing â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "sgma" && (
          <TabTransition tabKey="sgma">
            <TabIntro
              icon="/icons/clipboard.webp"
              headline="SGMA puts California on a groundwater clock"
              sub="The state has to close a 2 million acre-foot annual overdraft by 2040. That mandate is landing on a farm system already dealing with hotter conditions, weaker recharge, and less room for waste."
              accent={C.green}
            />

            <div style={{
              height: 180, borderRadius: 14, overflow: "hidden",
              backgroundImage: "url(/ca-fallow-dust.webp)",
              backgroundSize: "cover", backgroundPosition: "center 50%",
              position: "relative", marginBottom: 24,
            }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
              <div style={{
                position: "absolute", bottom: 14, left: 16,
                fontSize: 11, letterSpacing: "0.08em", fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'Inter', Arial, sans-serif",
              }}>
                NASA EARTH OBSERVATORY — CENTRAL VALLEY FALLOWED FIELDS, 2021
              </div>
            </div>

            <FadeIn>
              <div style={{
                padding: "26px 24px", background: C.cardGreen, borderRadius: 14,
                border: `1px solid ${C.borderGreen}`, marginBottom: 24,
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 16, fontWeight: 600 }}>
                  Sustainable Groundwater Management Act (SGMA)
                </div>
                <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 26, color: C.text, marginBottom: 18, lineHeight: 1.1 }}>
                  California's Reckoning — Mandated Sustainability by 2040
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                  {[
                    { val: "21", label: "Critically overdrafted basins under SGMA mandates" },
                    { val: "2040", label: "Sustainability deadline for all covered basins" },
                    { val: "2M ac-ft", label: "Annual groundwater overdraft that must be eliminated" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      padding: "18px 14px", background: C.card, borderRadius: 10, textAlign: "center",
                      border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(26px, 3.5vw, 46px)", color: C.green, lineHeight: 1, marginBottom: 8 }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <div style={{
                padding: "24px 22px", background: C.cardRed, borderRadius: 14,
                border: `1px solid ${C.borderRed}`, marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.redBright, marginBottom: 14, fontWeight: 600 }}>
                  The Fallowing Crisis - PPIC Projection
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 18,
                }}>
                  <div style={{
                    flex: "0 1 320px",
                    minWidth: 220,
                    background: "linear-gradient(180deg, #fff8f6 0%, #fff5f3 100%)",
                    border: `1px solid ${C.borderRed}`,
                    borderRadius: 10,
                    padding: "14px 14px 13px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: 1.1, textTransform: "uppercase", color: C.redBright, marginBottom: 4, fontWeight: 700 }}>
                      Projected by 2040
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(44px, 5vw, 68px)", color: C.red, lineHeight: 0.95 }}>500K-1M</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>acres permanently retired</div>
                  </div>
                  <div style={{ flex: "1 1 340px", minWidth: 260 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>
                      Largest forced agricultural contraction in American history
                    </div>
                    <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6 }}>
                      PPIC projects 500,000-1,000,000 acres of Central Valley farmland will be permanently retired
                      under SGMA compliance by 2040. This is structural removal from production, not seasonal fallowing.
                    </div>
                  </div>
                </div>
                <FallowingMeter />
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <StatCard value="67,000" label="Jobs destroyed — UC Davis worst-case scenario" color={C.red} watermark="67K" />
                  <StatCard value="$2.5B/yr" label="Annual revenue loss from permanently fallowed land" color={C.red} watermark="$2.5B" />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={160}>
              <div style={{
                padding: "26px 24px", background: C.cardGreen, borderRadius: 14,
                border: `1px solid ${C.borderGreen}`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 14 }}>
                  The Soil Solution to California's Water Crisis
                </div>
                <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.75, marginBottom: 20 }}>
                  Regenerative agriculture offers an SGMA compliance pathway that does not require permanent fallowing.
                  Every 1% increase in soil organic matter adds roughly{" "}
                  <strong style={{ color: C.text }}>20,000 gallons of water-holding capacity per acre</strong>{" "}
                  while reducing runoff, improving infiltration, and strengthening drought resilience in a warming climate.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }}>
                  {[
                    { src: "/d5146-1.webp", label: "Water-stressed stand" },
                    { src: "/d5147-1.webp", label: "Healthier cover-cropped edge" },
                  ].map((img, i) => (
                    <div key={i} style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      border: `1px solid ${C.borderGreen}`,
                      background: C.card,
                    }}>
                      <div style={{
                        height: 146,
                        backgroundImage: `url(${img.src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center center",
                      }} />
                      <div style={{
                        padding: "10px 12px 12px",
                        fontSize: 11,
                        color: C.textMuted,
                        lineHeight: 1.5,
                      }}>
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                  {[
                    { icon: "/icons/waterdrop.webp", title: "More water buffered in soil", desc: "About 20,000 additional gallons of water-holding capacity per acre per 1% SOM gain" },
                    { icon: "/icons/link.webp", title: "Aquifer recharge", desc: "High-infiltration soils recharge groundwater rather than generating runoff" },
                    { icon: "/icons/checklist.webp", title: "SGMA compliance pathway", desc: "On-farm water retention reduces pumping without permanent land retirement" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "18px 14px", background: C.card, borderRadius: 10,
                      border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ marginBottom: 10 }}>
                        <IconBadge
                          icon={item.icon}
                          size={20}
                          padding={8}
                          bg="rgba(106,157,42,0.1)"
                          border={`1px solid ${C.borderGreen}`}
                        />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <InsightBox title="The Bridge Forward" icon="/icons/plant.webp" accent={C.green}>
              Farmers transitioning to regenerative practices under SGMA compliance programs can qualify
              for groundwater banking credits, reduced pumping assessments, and transition funding.
              Every acre that improves water retention is an acre that stays productive —
              and every farmer who builds soil health is building the only water infrastructure
              that recharges itself for free.
            </InsightBox>
          </TabTransition>
        )}

        {/* â•â• TAB: Global Scarcity â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "global" && (
          <TabTransition tabKey="global">
            <div style={{
              height: 200, borderRadius: 14, overflow: "hidden",
              backgroundImage: "url(/graphic_earth_from_space.webp)",
              backgroundSize: "cover", backgroundPosition: "center center",
              position: "relative", marginBottom: 20,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, rgba(14,30,10,0.65) 0%, rgba(0,20,40,0.4) 60%, rgba(14,15,10,0.6) 100%)",
              }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(28px, 4vw, 48px)", color: "#fff", letterSpacing: 1, textShadow: "0 2px 20px rgba(0,0,0,0.9)", textAlign: "center" }}>
                  A Planetary Water Crisis
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 2, textTransform: "uppercase" }}>
                  71% of aquifers globally are in decline
                </div>
              </div>
            </div>
            <TabIntro
              icon="/icons/globe.webp"
              headline="Water stress and food demand are tightening together"
              sub="Agriculture already uses most of the world's freshwater. As warming lifts evaporation, trims snowpack, and pushes aquifers further into decline, food production depends more heavily on soils that can hold and cycle water well - and when water systems tighten, food systems tighten with them."
              accent={C.green}
            />

            <FadeIn>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
                alignItems: "stretch",
              }}>
                {/* Map — left column */}
                <div style={{
                  background: "#fff", border: "1px solid #ddd", borderRadius: 10,
                  padding: "12px 14px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase" }}>
                    U.S. Drought Monitor — March 12, 2026
                  </div>
                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}>
                    <img
                      src="/u.s.-drought-monitor-03-12-2026.webp"
                      alt="U.S. Drought Monitor Map"
                      style={{ width: "100%", borderRadius: 6, display: "block" }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 6 }}>
                    Source: National Drought Mitigation Center, USDA, NOAA
                  </div>
                </div>

                {/* Agriculture water share — right column */}
                <div style={{
                  background: C.card, borderRadius: 10, padding: "20px 18px",
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.green, marginBottom: 24, fontWeight: 600, textAlign: "center" }}>
                    Agriculture's Share of Global Water
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "nowrap", marginBottom: 6 }}>
                    <WaterDropFill percent={70} label="Global agricultural" sublabel="share of freshwater use" color={C.greenBright} size={100} />
                    <WaterDropFill percent={92} label="Humanity's food" sublabel="water footprint from farming" color="#3b82b0" size={100} />
                    <WaterDropFill percent={80} label="US water consumed" sublabel="by agriculture" color={C.green} size={100} />
                  </div>
                  <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { val: "71%", label: "Aquifer systems in decline", sub: "2000–2022, Jasechko et al. 2024, Nature", color: C.red },
                        { val: "71%", label: "Aquifers dropping", sub: "of 1,700 studied", color: C.red },
                        { val: "+125%", label: "Extraction increase", sub: "40-year rise", color: "#e67e22" },
                        { val: "4B", label: "People affected", sub: "severe scarcity/yr", color: "#e67e22" },
                      ].map((s) => (
                        <div key={`${s.val}-${s.label}`} style={{
                          textAlign: "center",
                          padding: "12px 10px 11px",
                          borderRadius: 10,
                          background: "linear-gradient(180deg, rgba(245,244,238,0.72) 0%, rgba(255,255,255,0.96) 100%)",
                          border: `1px solid ${s.color === C.red ? "rgba(192,57,43,0.14)" : "rgba(230,126,34,0.16)"}`,
                        }}>
                          <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 30, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text, marginTop: 0, lineHeight: 1.35 }}>{s.label}</div>
                          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, lineHeight: 1.35 }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <div style={{
                padding: "26px 24px", background: C.card, borderRadius: 14, marginBottom: 20,
                border: `1px solid ${C.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2.5, color: C.green, marginBottom: 16, fontWeight: 600 }}>
                  Groundwater Depletion Acceleration
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 18 }}>
                  {[
                    { yr: "1960", val: 126, pct: 45, color: C.green },
                    { yr: "1980", val: 178, pct: 63, color: "#8dc53a" },
                    { yr: "2000", val: 283, pct: 100, color: C.red },
                  ].map((d, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(26px,3vw,44px)", color: d.color, lineHeight: 1 }}>{d.val}</div>
                      <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 8 }}>km³/yr · {d.yr}</div>
                      <div style={{ height: 6, background: C.cardAlt, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${d.pct}%`, background: `linear-gradient(90deg, ${d.color}88, ${d.color})`, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{
                  padding: "10px 14px", background: `${C.red}0a`, borderRadius: 8,
                  border: `1px solid ${C.borderRed}`, marginBottom: 14,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 13, color: C.textSec }}>40-year increase in global groundwater extraction</span>
                  <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 28, color: C.red }}>+125%</span>
                </div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>
                  <strong style={{ color: C.text }}>71% of 1,700 aquifers studied are dropping.</strong>{" "}
                  90% of accelerating declines are in regions getting drier (Jasechko &amp; Perrone 2024, Nature).
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={120}>
              <ScarcityTimeline />
            </FadeIn>

            <FadeIn delay={140}>
              <DemandGapChart />
            </FadeIn>

            <AquiferHotspots />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
              <StatCard value="5B" label="People facing water scarcity by 2050 (WMO)" color={C.green} watermark="5B" delay={0} />
              <StatCard value="4B" label="Already face severe scarcity at least 1 month/year" color={C.red} watermark="4B" delay={80} />
              <StatCard value="56%" label="More food calories needed globally by 2050 (WRI)" color={C.red} watermark="56" delay={0} />
              <StatCard value="71%" label="Of global aquifer systems in decline (Jasechko et al. 2024)" color={C.red} watermark="71" delay={80} />
            </div>

            <InsightBox title="The Singular Connection" icon="/icons/link.webp" accent={C.green}>
              Rebuilding 1% soil organic matter simultaneously sequesters carbon, holds thousands of
              additional gallons of water per acre, reduces input costs by 40—50%, and improves drought
              resilience by 30%+. A single metric —{" "}
              <strong style={{ color: C.text }}>soil organic matter percentage</strong> — connects all
              three pillars of The Carbon Underground's evidence base. Water scarcity is not a resource
              problem. It is a climate problem expressed through soil and water systems, and ultimately
              through the stability of the food supply those systems support.
            </InsightBox>
          </TabTransition>
        )}

      </main>

      {/* â"€â"€ Footer â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <footer style={{
        maxWidth: 920, margin: "60px auto 0",
        padding: "24px 28px 32px",
        borderTop: "1px solid rgba(47,82,2,0.25)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Peer-Reviewed Sources</div>
            {[
              "Basche & DeLonge 2019 (PLOS ONE) — infiltration meta-analysis, 89 studies",
              "Hudson 1994 (Soil Sci. Am. J.) — SOM water holding capacity",
              "Jasechko & Perrone 2024 (Nature) — global aquifer decline acceleration",
              "USDA-NRCS — water retention research & SOM field data",
              "Stanford Water in the West 2024 — Central Valley subsidence",
              "USGS 2024 Groundwater Reports — Ogallala & Kansas aquifer data",
            ].map((s, i) => (
              <div key={i} style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.65, display: "flex", gap: 6 }}>
                <span style={{ color: "#2f5202", flexShrink: 0 }}>→</span>{s}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Institutional & Government</div>
            {[
              "PPIC Groundwater in California 2024 — fallowing projections",
              "California State Water Project 2025 — 87% delivery loss warning",
              "UC Davis Economic Analysis 2025 — SGMA job loss estimates",
              "California Farm Water Coalition — Kern County crop data",
              "WMO Global Water Resources Report — 5B scarcity projection",
              "FAO State of Food & Agriculture — global demand modeling",
              "NOAA Drought Monitor 2026 — US drought statistics",
            ].map((s, i) => (
              <div key={i} style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.65, display: "flex", gap: 6 }}>
                <span style={{ color: "#2f5202", flexShrink: 0 }}>→</span>{s}
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid rgba(47,82,2,0.12)",
        }}>
          <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            Download Review Pack
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/tcu-stats-companion-guide-2026-04-01-solidline.pdf", label: "Companion Guide PDF" },
              { href: "/tcu-stats-fact-check.pdf", label: "Fact-Check PDF" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                download
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "linear-gradient(180deg, #f0f4e6 0%, #e7edd8 100%)",
                  border: "1px solid rgba(106,157,42,0.28)",
                  color: "#264700",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>↓</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: "1px solid rgba(0,0,0,0.07)",
          fontSize: 10, color: "#3a3d38",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 8,
        }}>
          <div>Pillar 3 · The Carbon Underground · Data current through 2025</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/tcu-logo-black.webp" alt="TCU" style={{ height: 18, opacity: 0.65 }} />
            <span style={{ color: "rgba(0,0,0,0.15)" }}>|</span>
            <a href="#" style={{ display: "inline-flex" }}><img src="/icon-instagram.webp" alt="Instagram" style={{ height: 14, opacity: 0.5 }} /></a>
            <a href="#" style={{ display: "inline-flex" }}><img src="/icon-linkedin.webp" alt="LinkedIn" style={{ height: 14, opacity: 0.5 }} /></a>
            <a href="#" style={{ display: "inline-flex" }}><img src="/icon-tiktok.webp" alt="TikTok" style={{ height: 14, opacity: 0.5 }} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

