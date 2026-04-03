import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const BANKRUPTCY = [
  { year: "2019", filings: 595 },
  { year: "2020", filings: 560 },
  { year: "2021", filings: 276 },
  { year: "2022", filings: 176 },
  { year: "2023", filings: 139 },
  { year: "2024", filings: 216 },
  { year: "2025", filings: 315 },
];

const CROP_IMPACTS = [
  { crop: "Wheat",  loss: 5.5, icon: "/icons/wheat.webp",    color: "#c0392b" },
  { crop: "Maize",  loss: 3.8, icon: "/icons/corn-cob.webp", color: "#c0392b" },
];

const DISASTERS = [
  { period: "1980s",   gap: 82, events: 3.3  },
  { period: "1990s",   gap: 52, events: 5.5  },
  { period: "2000s",   gap: 35, events: 6.7  },
  { period: "2010s",   gap: 24, events: 13.1 },
  { period: "2020–24", gap: 18, events: 23   },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function ScrollProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setPct(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 9999, background: "rgba(0,0,0,0.08)" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: "linear-gradient(90deg, #3d6a10, #6a9d2a)",
        transition: "width 0.1s linear",
        boxShadow: "0 0 8px #6a9d2a80",
      }} />
    </div>
  );
}

function TabTransition({ children, id }) {
  const [visible, setVisible] = useState(true);
  const prev = useRef(id);
  useEffect(() => {
    if (prev.current !== id) {
      setVisible(false);
      const t = setTimeout(() => { prev.current = id; setVisible(true); }, 160);
      return () => clearTimeout(t);
    }
  }, [id]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
    }}>{children}</div>
  );
}

function BarAnimated({ width, color, delay = 0, height = 28 }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setW(width), delay);
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [width, delay]);
  return (
    <div ref={ref} style={{
      height, width: `${w}%`,
      background: `linear-gradient(90deg, ${color}dd, ${color}88)`,
      borderRadius: "0 6px 6px 0",
      transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
      minWidth: w > 0 ? 4 : 0,
      boxShadow: w > 0 ? `0 0 14px ${color}28` : "none",
    }} />
  );
}

function AnimatedNumber({ target, duration = 1400, prefix = "", suffix = "", decimals = 0 }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setCurrent((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return (
    <span ref={ref}>
      {prefix}{current.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
}

function IconBadge({
  icon,
  size = 18,
  bg = "transparent",
  border = "none",
  padding = 0,
  radius = 999,
  color = "#1a1a12",
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
        <img src={icon} alt="" style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
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

function TabIntro({ icon, headline, sub, color = "#6a9d2a" }) {
  return (
    <FadeIn>
      <div style={{
        padding: "18px 22px 18px",
        background: `linear-gradient(135deg, ${color}08 0%, rgba(245,244,238,0.96) 48%, rgba(240,238,232,0.9) 100%)`,
        borderRadius: 16,
        border: `1px solid ${color}20`,
        borderTop: `3px solid ${color}35`,
        marginBottom: 10,
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
          bg={`${color}10`}
          border={`1px solid ${color}20`}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color,
            fontSize: 9,
            letterSpacing: 2.1,
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 10,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
            Climate Connection
            <span style={{ height: 1, flex: 1, background: `${color}25` }} />
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1a1a12", marginBottom: 6, lineHeight: 1.35 }}>{headline}</div>
          <div style={{ fontSize: 13, color: "#5f6257", lineHeight: 1.68, maxWidth: 780 }}>{sub}</div>
        </div>
      </div>
    </FadeIn>
  );
}

function ROITimeline() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const years = [
    { label: "Year 1–2", title: "Transition", desc: "Input costs drop 20–40%. Soil biology begins recovering. Slight yield adjustment.", color: "#e67e22", pct: 30 },
    { label: "Year 3–5", title: "Stabilization", desc: "Carbon credits begin. Yield parity reached. Drought resilience measurable.", color: "#f4c430", pct: 62 },
    { label: "Year 5–8", title: "Profit Compounding", desc: "+$51–$118/acre net gain. Soil organic matter >3.5%. Reduced insurance claims.", color: "#6a9d2a", pct: 88 },
    { label: "Year 10+", title: "Full Resilience", desc: "Near-zero synthetic inputs. Significantly higher drought yield retention (Rodale FST). Carbon income stable.", color: "#3d6a10", pct: 100 },
  ];

  return (
    <div ref={ref} style={{ padding: "24px 22px", background: "#eeece8", borderRadius: 14, border: "1px solid rgba(106,157,42,0.18)" }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#7a7a6a", marginBottom: 18 }}>
        Regenerative Transition — Return on Investment by Year
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {years.map((y, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 14, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 13, color: y.color, letterSpacing: 1 }}>{y.label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a12" }}>{y.title}</div>
            </div>
            <div>
              <div style={{ background: "#f5f4ee", borderRadius: 6, height: 22, overflow: "hidden", marginBottom: 5, border: "1px solid rgba(0,0,0,0.07)" }}>
                <div style={{
                  height: "100%",
                  width: vis ? `${y.pct}%` : "0%",
                  background: `linear-gradient(90deg, ${y.color}99, ${y.color})`,
                  borderRadius: "0 4px 4px 0",
                  transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 180}ms`,
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.4 }}>{y.desc}</div>
            </div>
            <div style={{
              fontSize: 10,
              color: "#6a6a5a",
              textAlign: "right",
              flexShrink: 0,
              letterSpacing: 1.1,
              textTransform: "uppercase",
              fontWeight: 700,
            }}>stage</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 10, color: "#7a7a6a" }}>
        Timeline based on Soil Health Institute 100-farm study, LaCanne & Lundgren 2018, and Rodale Institute FST data.
      </div>
    </div>
  );
}

function RegenBuffer() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ padding: "24px 22px", background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)", borderRadius: 14, border: "1px solid rgba(106,157,42,0.3)" }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 16 }}>
        The Climate Buffer — Drought Year Yield Comparison
      </div>
      <div style={{ fontSize: 10, color: "#8a8a7a", marginBottom: 12 }}>Relative yield index — conventional = 100. Source: Rodale FST, 30-year trial.</div>
      <div style={{ marginBottom: 16 }}>
        {[
          { label: "Regenerative", barPct: 100, displayVal: "131", color: "#6a9d2a" },
          { label: "Conventional", barPct: 76,  displayVal: "100", color: "#c0392b" },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "#6a9d2a" : "#6a6a5a" }}>{item.label}</span>
              <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 22, color: item.color }}>{item.displayVal}</span>
            </div>
            <div style={{ background: "#f5f4ee", borderRadius: 6, height: 28, overflow: "hidden", border: `1px solid ${item.color}18` }}>
              <div style={{
                height: "100%",
                width: vis ? `${item.barPct}%` : "0%",
                background: i === 0 ? "linear-gradient(90deg, #2f5202, #6a9d2a)" : "linear-gradient(90deg, #7a1f1f, #c0392b)",
                borderRadius: "0 4px 4px 0",
                transition: `width 1.3s cubic-bezier(0.22,1,0.36,1) ${i * 250}ms`,
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
              }}>
                {vis && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>yield index</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <InsightBox color="#6a9d2a">
        <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.65 }}>
          In drought years, regenerative farms significantly outperform conventional. Rodale's 30-year Farming Systems Trial found organic corn yields <strong style={{ color: "#1a1a12" }}>28–34% higher than conventional</strong> during drought years. Healthy soil organic matter holds 20× more water per acre. This is insurance that doesn't expire.
        </div>
      </InsightBox>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        background: "linear-gradient(90deg, #2f5202, #3d6a10)",
        padding: "9px 20px", display: "inline-block",
        borderRadius: "2px 12px 12px 2px", marginBottom: sub ? 10 : 0,
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: 21, letterSpacing: 2.5, color: "#ffffff",
          margin: 0, fontWeight: 400,
        }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 13, color: "#6a6a5a", margin: 0, lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );
}

// ─── Insight Box ──────────────────────────────────────────────────────────────

function InsightBox({ children, color = "#6a9d2a" }) {
  return (
    <div style={{
      padding: "14px 18px",
      background: `linear-gradient(135deg, ${color}0d 0%, rgba(240,238,232,0.85) 100%)`,
      border: `1px solid ${color}25`,
      borderLeft: `3px solid ${color}`,
      borderRadius: "0 10px 10px 0",
    }}>{children}</div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, sub, color = "#6a9d2a", accent, delay = 0, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        style={{
          padding: "24px 20px",
          background: hovered
            ? "linear-gradient(145deg, #e2e0da, #eeece8)"
            : "linear-gradient(145deg, #e8e6e0, #f0eee8)",
          borderRadius: 14,
          border: `1px solid ${hovered ? (accent || `${color}30`) : (accent || "rgba(106,157,42,0.14)")}`,
          position: "relative", overflow: "hidden",
          height: "100%", boxSizing: "border-box",
          transition: "all 0.22s ease", cursor: "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon && (
          <div style={{ marginBottom: 10 }}>
            <IconBadge
              icon={icon}
              size={18}
              padding={8}
              bg={`${color}12`}
              border={`1px solid ${accent || `${color}30`}`}
            />
          </div>
        )}
        <div style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "clamp(28px, 3.5vw, 48px)",
          color, lineHeight: 1, marginBottom: 8,
        }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a12", marginBottom: 5 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.6 }}>{sub}</div>}
        {/* Bottom accent */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${color}00, ${color}${hovered ? "55" : "18"}, ${color}00)`,
          transition: "background 0.3s ease",
        }} />
      </div>
    </FadeIn>
  );
}

// ─── Compare Bar ──────────────────────────────────────────────────────────────

function CompareBar({ label, regen, conv, maxVal, unit = "", note = "", delay = 0, higherIsBetter = true }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const regenWins = higherIsBetter ? regen > conv : regen < conv;
  const delta = higherIsBetter
    ? ((regen - conv) / conv * 100).toFixed(0)
    : ((conv - regen) / conv * 100).toFixed(0);

  return (
    <div ref={ref} style={{
      padding: "18px 20px",
      background: "#eeece8",
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,0.07)",
      marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2a2a1e" }}>{label}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {note && <div style={{ fontSize: 10, color: "#7a7a6a", fontStyle: "italic" }}>{note}</div>}
          {regenWins && (
            <div style={{
              fontSize: 10, padding: "2px 10px",
              background: "rgba(106,157,42,0.14)",
              border: "1px solid rgba(106,157,42,0.3)",
              borderRadius: 10, color: "#6a9d2a", letterSpacing: 0.8,
            }}>+{delta}% regen advantage</div>
          )}
        </div>
      </div>

      {/* Regen row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 7 }}>
        <span style={{ width: 108, fontSize: 11, color: "#6a9d2a", textAlign: "right", flexShrink: 0, letterSpacing: 0.3 }}>Regenerative</span>
        <div style={{ flex: 1, background: "#f5f4ee", borderRadius: 4, height: 30, overflow: "hidden", border: "1px solid rgba(106,157,42,0.1)" }}>
          <div style={{
            height: "100%",
            width: vis ? `${(regen / maxVal) * 100}%` : "0%",
            background: "linear-gradient(90deg, #2f5202, #6a9d2a)",
            borderRadius: "0 4px 4px 0",
            transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
          }}>
            {vis && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                {regen}{unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Conv row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ width: 108, fontSize: 11, color: "#7a7a6a", textAlign: "right", flexShrink: 0, letterSpacing: 0.3 }}>Conventional</span>
        <div style={{ flex: 1, background: "#f5f4ee", borderRadius: 4, height: 30, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{
            height: "100%",
            width: vis ? `${(conv / maxVal) * 100}%` : "0%",
            background: "linear-gradient(90deg, #2a2015, #4a3820)",
            borderRadius: "0 4px 4px 0",
            transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${delay + 150}ms`,
            display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
          }}>
            {vis && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ccc", whiteSpace: "nowrap" }}>
                {conv}{unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bankruptcy Chart ─────────────────────────────────────────────────────────

function BankruptcyChart() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const maxF = 640;
  const w = 680, h = 280, pl = 56, pr = 24, pt = 28, pb = 44;
  const pw = w - pl - pr, ph = h - pt - pb;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const barW = pw / BANKRUPTCY.length - 12;
  const yScale = v => pt + ph - (v / maxF) * ph;

  // Trend line points
  const points = BANKRUPTCY.map((d, i) => {
    const x = pl + (i / BANKRUPTCY.length) * pw + barW / 2 + 6;
    const y = vis ? yScale(d.filings) : pt + ph;
    return `${x},${y}`;
  });

  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="bankGradUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#7a1f1f" stopOpacity={0.7} />
        </linearGradient>
        <linearGradient id="bankGradDn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2f1b" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#1e1a0e" stopOpacity={0.7} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 150, 300, 450, 600].map(v => (
        <g key={v}>
          <line x1={pl} x2={w - pr} y1={yScale(v)} y2={yScale(v)}
            stroke={v === 0 ? "rgba(98,100,102,0.5)" : "rgba(98,100,102,0.15)"}
            strokeWidth={v === 0 ? 1 : 0.6} strokeDasharray={v === 0 ? "0" : "4,6"} />
          <text x={pl - 10} y={yScale(v) + 4} textAnchor="end" fill="#7a7a6a" fontSize={10} fontFamily="Arial,sans-serif">{v}</text>
        </g>
      ))}

      {/* Y label */}
      <text x={14} y={pt + ph / 2} textAnchor="middle" fill="#7a7a6a" fontSize={9} fontFamily="Arial,sans-serif"
        transform={`rotate(-90, 14, ${pt + ph / 2})`}>Filings</text>

      {/* Bars */}
      {BANKRUPTCY.map((d, i) => {
        const x = pl + (i / BANKRUPTCY.length) * pw + 6;
        const barH = (d.filings / maxF) * ph;
        const isRise = i >= 5;
        return (
          <g key={d.year}>
            <rect
              x={x} y={vis ? yScale(d.filings) : pt + ph}
              width={barW} height={vis ? barH : 0}
              fill={isRise ? "url(#bankGradUp)" : "url(#bankGradDn)"} rx={5}
              style={{ transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms` }}
            />
            <text x={x + barW / 2} y={h - 10} textAnchor="middle" fill="#6a6a5a" fontSize={11} fontFamily="Arial,sans-serif">{d.year}</text>
            {vis && (
              <text
                x={x + barW / 2} y={yScale(d.filings) - 7}
                textAnchor="middle"
                fill={isRise ? "#e74c3c" : "#5a5a4a"}
                fontSize={12} fontWeight={700} fontFamily="Arial,sans-serif"
              >{d.filings}</text>
            )}
          </g>
        );
      })}

      {/* Trendline */}
      {vis && (
        <polyline
          points={points.join(" ")}
          fill="none" stroke="rgba(231,76,60,0.35)" strokeWidth={1.5} strokeDasharray="4,4"
          style={{ transition: "opacity 0.5s ease 1s" }}
        />
      )}

      {/* Annotation */}
      {vis && (
        <>
          <rect x={pl + (5.2 / 7) * pw} y={pt - 6} width={126} height={26} rx={5}
            fill="rgba(245,244,238,0.96)" stroke="rgba(231,76,60,0.4)" strokeWidth={1} />
          <text x={pl + (5.2 / 7) * pw + 63} y={pt + 9} textAnchor="middle"
            fill="#e74c3c" fontSize={11} fontWeight={700} fontFamily="Arial,sans-serif">
            +127% from 2023 low
          </text>
        </>
      )}
    </svg>
  );
}

// ─── Funding Gap Meter ────────────────────────────────────────────────────────

function FundingGapMeter() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const funded = 9; // <10%

  return (
    <div ref={ref} style={{ padding: "26px 24px", background: "#eeece8", borderRadius: 14, border: "1px solid rgba(106,157,42,0.18)" }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#7a7a6a", marginBottom: 16 }}>
        The Funding Gap - Investment Needed vs. Deployed
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "baseline" }}>
          <div style={{ fontSize: 11, color: "#6a6a5a" }}>Capital deployed</div>
          <div style={{ fontSize: 11, color: "#6a6a5a" }}>Annual need: $200-450B</div>
        </div>
        <div style={{ position: "relative", background: "#f5f4ee", borderRadius: 8, height: 40, overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 11, color: "rgba(192,57,43,0.6)", fontWeight: 600, letterSpacing: 0.5,
            pointerEvents: "none",
          }}>91%+ UNFUNDED</div>
          <div style={{
            height: "100%",
            width: vis ? `${funded}%` : "0%",
            background: "linear-gradient(90deg, #2f5202, #6a9d2a)",
            borderRadius: "0 6px 6px 0",
            transition: "width 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s",
            display: "flex", alignItems: "center", paddingLeft: 12,
            position: "relative", zIndex: 1,
            boxShadow: "4px 0 12px rgba(106,157,42,0.3)",
          }}>
            {vis && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>~$20B</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{ fontSize: 9, color: "#7a7a6a" }}>$0</div>
          <div style={{ fontSize: 9, color: "#7a7a6a" }}>$200-450B needed annually</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        {[
          { val: "$200-450B", label: "Annual global need", sub: "To achieve soil restoration at scale.", color: "#1a1a12" },
          { val: "<10%", label: "Currently funded", sub: "Gap is structural, not informational.", color: "#c0392b" },
          { val: "$1B", label: "Bezos Earth Fund", sub: "Largest single commitment. Still <1% of the gap.", color: "#7a7a6a" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "16px 14px", background: "#f5f4ee",
            borderRadius: 10, border: `1px solid ${i === 1 ? "rgba(192,57,43,0.2)" : "rgba(0,0,0,0.07)"}`,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(24px, 2.5vw, 38px)", color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a12", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.5 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisasterTrend() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const maxEvents = 23;
  const icons = ["🌱", "🌤", "⛅", "🌩", "🔥"];

  return (
    <div ref={ref}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#2a2a1e" }}>Billion-Dollar Disaster Frequency (NOAA)</div>
        <div style={{ display: "flex", gap: 18 }}>
          <span style={{ fontSize: 9, color: "#7a7a6a", letterSpacing: 1, textTransform: "uppercase" }}>Events/yr</span>
          <span style={{ fontSize: 9, color: "#7a7a6a", letterSpacing: 1, textTransform: "uppercase" }}>Days apart</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#6a6a5a", marginBottom: 18, lineHeight: 1.6 }}>
        Average gap between billion-dollar US weather disasters. From once every 82 days in the 1980s to once every <strong style={{ color: "#e74c3c" }}>18 days</strong> in 2020–24.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {DISASTERS.map((d, i) => {
          const isHot = i >= 3;
          const heat = i / (DISASTERS.length - 1); // 0 to 1
          const barColor = isHot
            ? `linear-gradient(90deg, #7a1f1f, #c0392b)`
            : `linear-gradient(90deg, #1e1a0e, #3a2f1b)`;
          return (
            <div key={d.period} style={{
              display: "grid", gridTemplateColumns: "26px 72px 1fr 72px 90px",
              alignItems: "center", gap: 12,
              padding: "11px 16px",
              background: isHot
                ? `linear-gradient(135deg, rgba(192,57,43,${0.04 + heat * 0.08}) 0%, #f5f4ee 100%)`
                : "#eeece8",
              borderRadius: 10,
              border: `1px solid ${isHot ? `rgba(192,57,43,${0.1 + heat * 0.2})` : "rgba(0,0,0,0.07)"}`,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{icons[i]}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isHot ? "#c0392b" : "#6a6a5a" }}>{d.period}</span>
              <div style={{ background: "#f5f4ee", borderRadius: 4, height: 18, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: vis ? `${(d.events / maxEvents) * 100}%` : "0%",
                  background: barColor,
                  borderRadius: "0 4px 4px 0",
                  transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 120}ms`,
                }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 20, color: isHot ? "#e74c3c" : "#6a6a5a" }}>{d.events}</span>
                <span style={{ fontSize: 9, color: "#7a7a6a" }}>/yr</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 20, color: isHot ? "#e74c3c" : "#6a6a5a" }}>{d.gap}</span>
                <span style={{ fontSize: 9, color: "#7a7a6a" }}> days</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}>
        <InsightBox color="#c0392b">
          <div style={{ fontSize: 12, color: "#2a2a1e", lineHeight: 1.7 }}>
            Munich Re: <strong style={{ color: "#1a1a12" }}>$320B in total economic losses from climate disasters in 2024</strong> — a record. Insurance is no longer a safety net; it is a trailing indicator of systemic soil and climate failure.
          </div>
        </InsightBox>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function EconomicsViz() {
  const [activeTab, setActiveTab] = useState("yields");

  const tabs = [
    { id: "yields",    label: "Climate & Yields",      desc: "What warming costs farmers" },
    { id: "profit",    label: "Profitability",         desc: "The economic case for regenerative" },
    { id: "casestudy", label: "Case Studies",          desc: "Real farms, real results" },
    { id: "stress",    label: "Farm Financial Stress", desc: "The crisis in conventional ag" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f4ee",
      color: "#1a1a12",
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      padding: "0 0 80px",
    }}>
      <ScrollProgressBar />

      {/* ── Hero ── */}
      <div style={{ position: "relative", minHeight: 400, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/farmer-feature.webp)",
          backgroundSize: "cover", backgroundPosition: "center 20%",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(14,15,10,0.78) 0%, rgba(14,15,10,0.58) 36%, rgba(14,15,10,0.26) 70%, rgba(14,15,10,0.16) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(14,15,10,0) 0%, rgba(14,15,10,0.75) 60%, #f5f4ee 100%)",
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
            Pillar 2 - The Carbon Underground
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "clamp(44px, 6.5vw, 82px)",
            lineHeight: 0.96, margin: 0,
            color: "#ffffff",
            textShadow: "0 2px 40px rgba(0,0,0,0.9)",
          }}>
            Climate Risk Hits<br />
            <span style={{ color: "#6a9d2a" }}>the Farm Ledger</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15.5, lineHeight: 1.75, marginTop: 20, maxWidth: 560 }}>
            Climate change is already breaking farm economics. Regenerative farms earn <strong style={{ color: "#dce7cb" }}>78% higher profits</strong> because they store more carbon, hold more water, and reduce dependence on the same synthetic inputs driving climate risk.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            marginTop: 24,
            maxWidth: 700,
          }}>
            {[
              { title: "Profit edge", stat: "+78%", statLabel: "regen profits", accent: "#6a9d2a" },
              { title: "Nitrogen risk", stat: "273x", statLabel: "N2O warming power", accent: "#e74c3c" },
              { title: "Transition upside", stat: "$250B", statLabel: "McKinsey opportunity", accent: "#6a9d2a" },
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
                    fontSize: item.stat.length > 5 ? 24 : 30,
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

      {/* ── Facts Strip ── */}
      <div style={{
        background: "linear-gradient(90deg, #1f3205 0%, #2f5202 50%, #1f3205 100%)",
        borderTop: "1px solid rgba(106,157,42,0.2)",
        borderBottom: "1px solid rgba(106,157,42,0.25)",
      }}>
        <div style={{
          maxWidth: 1020, margin: "0 auto", padding: "6px 16px",
          display: "flex", gap: 6, flexWrap: "nowrap", justifyContent: "center", overflowX: "auto",
        }}>
          {[
            { label: "+78% profits", sub: "on regen farms" },
            { label: "$250B", sub: "McKinsey projection" },
            { label: "$624.7B", sub: "US farm debt by 2026" },
            { label: "$320B losses", sub: "total economic, global climate 2024" },
            { label: "273x", sub: "N2O vs. CO2 warming power" },
          ].map((item, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
              border: "1px solid rgba(106,157,42,0.25)",
              borderRadius: 999, padding: "4px 9px",
              background: "rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 13, letterSpacing: 0.8, color: "#e3ecd2" }}>{item.label}</span>
              <span style={{ fontSize: 10, color: "rgba(233,240,219,0.72)" }}>{item.sub}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{
        background: "rgba(245,244,238,0.97)", borderBottom: "1px solid rgba(47,82,2,0.25)",
        position: "sticky", top: 64, zIndex: 100, backdropFilter: "blur(10px)",
      }}>
        <nav style={{ maxWidth: 1020, margin: "0 auto", padding: "10px 28px", display: "flex", gap: 10, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "9px 12px 8px",
              minWidth: 160,
              textAlign: "left",
              background: activeTab === t.id ? "#eaf0dd" : "rgba(255,255,255,0.75)",
              border: activeTab === t.id ? "1px solid rgba(106,157,42,0.45)" : "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              borderBottom: activeTab === t.id ? "3px solid #6a9d2a" : "1px solid rgba(0,0,0,0.08)",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: 24,
                lineHeight: 1,
                letterSpacing: 0.4,
                color: activeTab === t.id ? "#1a1a12" : "#3f423c",
                marginBottom: 2,
              }}>
                {t.label}
              </div>
              <div style={{
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: activeTab === t.id ? "#4b6f1d" : "#7a7a6a",
              }}>
                {t.desc}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <main style={{ maxWidth: 1020, margin: "0 auto", padding: "26px 28px 0" }}>
        <TabTransition id={activeTab}>

        {/* ══════════════════════════════════════════════════════════════
            TAB: PROFITABILITY
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "profit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            <TabIntro
              icon="/icons/financial.webp"
              headline="Regenerative farming is climate adaptation that pays"
              sub="The data from 100-farm studies, McKinsey projections, and real-farm case studies converge on one conclusion: soil health and financial health are the same system."
            />

            {/* Top 3 stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <StatCard value="+78%" label="Higher profits on regen farms"
                sub="LaCanne & Lundgren, 2018 — 20 Northern Plains farms."
                color="#6a9d2a" delay={0} icon="/icons/graph.webp" />
              <StatCard value="$51.60" label="Net return per acre above cost — corn"
                sub="SHI 100-farm study. 85% of participating farmers saw net gains."
                color="#6a9d2a" delay={80} icon="/icons/corn-cob.webp" />
              <StatCard value="$44.89" label="Net return per acre — soy"
                sub="Same SHI study. After all transition costs. Soil Health Institute, 2021."
                color="#6a9d2a" delay={160} icon="/icons/soy.webp" />
            </div>

            {/* SHI callout */}
            <FadeIn delay={80}>
              <div style={{
                padding: "28px 26px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 16, border: "1px solid rgba(106,157,42,0.3)",
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 28, alignItems: "center",
              }}>
                <div style={{ textAlign: "center", minWidth: 120 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(48px, 5.5vw, 72px)",
                    color: "#6a9d2a", lineHeight: 1,
                  }}>85%</div>
                  <div style={{ fontSize: 11, color: "#7a7a6a", marginTop: 4 }}>of farmers</div>
                  <div style={{
                    marginTop: 10, padding: "4px 12px",
                    background: "rgba(106,157,42,0.1)", borderRadius: 20,
                    fontSize: 9, color: "#6a9d2a", letterSpacing: 1.5,
                  }}>100 FARMS</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 10 }}>
                    Soil Health Institute · 100-Farm Study
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a12", marginBottom: 10 }}>
                    85% of participating farmers saw positive net returns from soil health practices
                  </div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75 }}>
                    The largest real-farm economic study of regenerative agriculture. $51.60/acre net return for corn, $44.89 for soy — after accounting for all transition costs, equipment changes, and learning curves. A separate 30-farm study found <strong style={{ color: "#1a1a12" }}>$65/acre average gains</strong>.
                  </div>
                </div>
                </div>
              </FadeIn>

            {/* Side-by-side comparison */}
            <FadeIn delay={120}>
              <div>
                <SectionHeader title="Side-by-Side Comparison" sub="Regenerative vs. conventional across three key climate-finance metrics." />
                <CompareBar label="Net profit ($/acre)" regen={118} conv={66} maxVal={140} unit="$/ac" delay={0} />
                <CompareBar label="Input costs index" regen={55} conv={100} maxVal={110} note="lower = better" delay={100} higherIsBetter={false} />
                <CompareBar label="Drought year yield advantage (regen vs. conv)" regen={134} conv={100} maxVal={150} unit="%" delay={200} />
              </div>
            </FadeIn>

            {/* McKinsey + hidden costs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              <FadeIn delay={80}>
                <div style={{
                  padding: "24px 22px", background: "#eeece8",
                  borderRadius: 14, borderLeft: "4px solid #6a9d2a",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 12 }}>
                    McKinsey 2024 Projection
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(34px, 4vw, 54px)",
                    color: "#1a1a12", lineHeight: 1, marginBottom: 10,
                  }}>$250B</div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.7, marginBottom: 14 }}>
                    Incremental economic value over a decade at 80% US corn/soy adoption of regenerative practices - the economic value of a climate solution, not just a farming method.
                  </div>
                  <InsightBox color="#6a9d2a">
                    <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.6 }}>
                      Boston Consulting Group: up to <strong style={{ color: "#5a5a4a" }}>130% long-term ROI</strong> on regenerative transitions, reinforcing that resilience is now an investable climate outcome.</div>
                  </InsightBox>
                </div>
              </FadeIn>

              <FadeIn delay={160}>
                <div style={{
                  padding: "24px 22px",
                  background: "linear-gradient(135deg, #fdf0ee, #f5f4ee)",
                  borderRadius: 14, borderLeft: "4px solid #c0392b",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#e74c3c", marginBottom: 12 }}>
                    Climate Cost of Input Dependence
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 40, color: "#c0392b", lineHeight: 1 }}>$500M+</div>
                      <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.5, marginTop: 6 }}>Extra fertilizer — US corn farmers annually, replacing fertility lost to degradation.</div>
                      <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 4 }}>Jang et al., 2020</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 40, color: "#c0392b", lineHeight: 1 }}>273x</div>
                      <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.5, marginTop: 6 }}>Nitrous oxide warming power relative to CO2. Synthetic nitrogen is both an input-cost issue and a climate-risk issue.</div>
                      <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 4 }}>IPCC AR6; UNEP Global Nitrous Oxide Assessment</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#2a2a1e", lineHeight: 1.65 }}>
                    Synthetic fertilizer is not just an expense line. It is a greenhouse gas line. Lower input dependence means lower exposure to N2O emissions, volatile fertilizer markets, and climate-driven margin compression.
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Carbon credit market */}
            <FadeIn delay={160}>
              <div style={{
                padding: "24px 22px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 14, border: "1px solid rgba(106,157,42,0.25)",
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 16 }}>
                  Carbon Credit Revenue — Additional Farm Income
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {[
                    { val: "$4.50-$11.25", label: "Per acre/year", sub: "carbon credit revenue" },
                    { val: "8M+ acres", label: "Enrolled", sub: "Indigo Ag platform globally" },
                    { val: "2M+ tons", label: "CO2e credits verified", sub: "documented across Indigo Ag projects" },
                    { val: "$2.8B", label: "Public transition support", sub: "USDA climate-smart commodity funding committed since 2022" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      padding: "16px 14px", background: "#f5f4ee",
                      borderRadius: 10, textAlign: "center",
                      border: "1px solid rgba(106,157,42,0.12)",
                    }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 18, color: "#6a9d2a", lineHeight: 1.2, marginBottom: 6 }}>{s.val}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a12", marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.4 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Daniel Unruh case */}
            <FadeIn delay={200}>
              <div style={{
                padding: "26px 26px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 14, border: "1px solid rgba(106,157,42,0.3)",
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 28, alignItems: "center",
              }}>
                <div style={{ textAlign: "center", minWidth: 110 }}>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 62, color: "#6a9d2a", lineHeight: 1 }}>$425</div>
                  <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 4 }}>per acre</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 10 }}>
                    Case Study · Daniel Unruh, California · TCUDATA 2025
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a12", marginBottom: 8 }}>
                    Net income increase over 6 years after regenerative transition
                  </div>
                  <div style={{ fontSize: 13, color: "#2a2a1e", lineHeight: 1.7 }}>
                    Achieved through combined soil carbon gains, reduced input costs, and premium market access — without sacrificing yields.
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ROI Timeline */}
            <FadeIn delay={200}>
              <ROITimeline />
            </FadeIn>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: CASE STUDIES
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "casestudy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TabIntro
              icon="/icons/checklist.webp"
              headline="These aren't pilot projects — they're scalable, documented business transformations"
              sub="Every farm below followed the same playbook: stop destroying soil biology, start rebuilding it. The financial returns followed predictably because climate resilience, lower inputs, and carbon performance improved together."
            />
            <FadeIn>
              <SectionHeader
                title="Real Farm Transformations"
                sub="Documented outcomes from farms that turned soil restoration into both stronger business performance and stronger climate performance."
              />
            </FadeIn>

            {/* Gabe Brown */}
            <FadeIn delay={0}>
              <div style={{
                padding: "28px 26px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 16, border: "1px solid rgba(106,157,42,0.3)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 6 }}>
                      Gabe Brown - Brown's Ranch - North Dakota
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 26, color: "#1a1a12", lineHeight: 1.1 }}>
                      From Near Bankruptcy to Benchmark Farm
                    </div>
                  </div>
                  <div style={{
                    flexShrink: 0, marginLeft: 18,
                    background: "linear-gradient(135deg, #2f5202, #6a9d2a)",
                    borderRadius: 10, padding: "11px 15px",
                    textAlign: "center", minWidth: 84,
                    boxShadow: "0 4px 14px rgba(106,157,42,0.3)",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 28, color: "#fff", lineHeight: 1 }}>5K</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.82)", letterSpacing: 1.4, textTransform: "uppercase", marginTop: 3 }}>acres - 20+ yrs</div>
                </div>
              </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(106,157,42,0.16)", background: "#f5f4ee" }}>
                    <img src="/gabe-brown-farm.webp" alt="Brown's Ranch landscape" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>Brown's Ranch field conditions after long-term regenerative transition.</div>
                  </div>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(106,157,42,0.16)", background: "#f5f4ee" }}>
                    <img src="/gabe-brown-portrait.webp" alt="Gabe Brown portrait" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>Gabe Brown, whose ranch became a flagship case study for soil-first management.</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { before: "1.9%",      after: "6.1%",        label: "Soil organic matter",       delta: "+221%",    bp: 24, ap: 76 },
                    { before: "0.5 in/hr", after: "8 in/hr",     label: "Water infiltration rate",   delta: "+16x",     bp: 6,  ap: 95 },
                    { before: "100%",      after: "-41 to -53%", label: "Synthetic fertilizer use",  delta: "-41-53%",  bp: 100, ap: 50 },
                    { before: "~$80K/yr",  after: "$0",          label: "Fungicide/herbicide spend", delta: "100% cut", bp: 80, ap: 0  },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "14px 14px 12px", background: "#f5f4ee",
                      borderRadius: 10, border: "1px solid rgba(106,157,42,0.12)",
                      display: "flex", flexDirection: "column",
                    }}>
                      <div style={{ fontSize: 11, color: "#6a6a5a", marginBottom: 12, lineHeight: 1.4, flexGrow: 1 }}>{item.label}</div>

                      <div style={{ marginBottom: 5 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                          <span style={{ fontSize: 7.5, color: "#9a9a8a", letterSpacing: 1.2, textTransform: "uppercase" }}>Before</span>
                          <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 17, color: "#9a9a8a", lineHeight: 1 }}>{item.before}</span>
                        </div>
                        <div style={{ height: 5, background: "#dddbd6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.bp}%`, background: "linear-gradient(90deg, #9a9a8a, #b8b5ae)", borderRadius: 3 }} />
                        </div>
                      </div>

                      <div style={{ textAlign: "center", color: "#6a9d2a", fontSize: 13, lineHeight: 1, margin: "3px 0" }}>↓</div>

                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                          <span style={{ fontSize: 7.5, color: "#6a9d2a", letterSpacing: 1.2, textTransform: "uppercase" }}>After</span>
                          <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 17, color: "#6a9d2a", lineHeight: 1 }}>{item.after}</span>
                        </div>
                        <div style={{ height: 5, background: "#dddbd6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.ap}%`, background: "linear-gradient(90deg, #4a8a1a, #6a9d2a)", borderRadius: 3 }} />
                        </div>
                      </div>

                      <div style={{
                        display: "inline-block",
                        background: "rgba(106,157,42,0.12)",
                        border: "1px solid rgba(106,157,42,0.25)",
                        borderRadius: 4, padding: "2px 7px",
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                        color: "#4e7a1e", textTransform: "uppercase",
                        alignSelf: "flex-start",
                      }}>{item.delta}</div>
                    </div>
                  ))}
                </div>

                <InsightBox color="#6a9d2a">
                  <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.7 }}>
                    Brown transformed 5,000 acres over 20+ years. Soil carbon rose from 1.9% to 6.1%, approaching virgin prairie levels. Water infiltration improved 16x, eliminating irrigation need, and the ranch became a working example of climate adaptation through soil recovery. Source: Brown's Ranch case study, NRCS.
                  </div>
                </InsightBox>
              </div>
            </FadeIn>

            {/* White Oak Pastures */}
            <FadeIn delay={80}>
              <div style={{
                padding: "28px 26px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 16, border: "1px solid rgba(106,157,42,0.3)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 6 }}>
                      Will Harris - White Oak Pastures - Bluffton, Georgia
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 26, color: "#1a1a12", lineHeight: 1.1 }}>
                      From Industrial Cattle Ranch to Carbon-Negative Operation
                    </div>
                  </div>
                  <div style={{
                    flexShrink: 0, marginLeft: 18,
                    background: "linear-gradient(135deg, #2f5202, #6a9d2a)",
                    borderRadius: 10, padding: "11px 15px",
                    textAlign: "center", minWidth: 84,
                    boxShadow: "0 4px 14px rgba(106,157,42,0.3)",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 28, color: "#fff", lineHeight: 1 }}>20x</div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.82)", letterSpacing: 1.4, textTransform: "uppercase", marginTop: 3 }}>revenue growth</div>
                </div>
              </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(106,157,42,0.16)", background: "#f5f4ee" }}>
                    <img src="/white-oak-pastures-grazing.webp" alt="White Oak Pastures grazing scene" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>Adaptive multi-species grazing at White Oak Pastures.</div>
                  </div>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(106,157,42,0.16)", background: "#f5f4ee" }}>
                    <img src="/will-harris-portrait.webp" alt="Will Harris portrait" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>Will Harris, whose operation became a leading regenerative ranching case study.</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { before: "~$1M",  after: "$20M+",  label: "Annual gross revenue",          delta: "20x growth",  bp: 5,  ap: 100 },
                    { before: "14",    after: "180+",   label: "Local employees",               delta: "+13x jobs",   bp: 8,  ap: 95  },
                    { before: "High",  after: "-80%+",  label: "Annual input costs",            delta: "80% cut",     bp: 90, ap: 18  },
                    { before: "Net +", after: "Net -",  label: "Carbon balance (LCA verified)", delta: "carbon-neg.", bp: 55, ap: 6   },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "14px 14px 12px", background: "#f5f4ee",
                      borderRadius: 10, border: "1px solid rgba(106,157,42,0.12)",
                      display: "flex", flexDirection: "column",
                    }}>
                      <div style={{ fontSize: 11, color: "#6a6a5a", marginBottom: 12, lineHeight: 1.4, flexGrow: 1 }}>{item.label}</div>

                      <div style={{ marginBottom: 5 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                          <span style={{ fontSize: 7.5, color: "#9a9a8a", letterSpacing: 1.2, textTransform: "uppercase" }}>Before</span>
                          <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 17, color: "#9a9a8a", lineHeight: 1 }}>{item.before}</span>
                        </div>
                        <div style={{ height: 5, background: "#dddbd6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.bp}%`, background: "linear-gradient(90deg, #9a9a8a, #b8b5ae)", borderRadius: 3 }} />
                        </div>
                      </div>

                      <div style={{ textAlign: "center", color: "#6a9d2a", fontSize: 13, lineHeight: 1, margin: "3px 0" }}>↓</div>

                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                          <span style={{ fontSize: 7.5, color: "#6a9d2a", letterSpacing: 1.2, textTransform: "uppercase" }}>After</span>
                          <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 17, color: "#6a9d2a", lineHeight: 1 }}>{item.after}</span>
                        </div>
                        <div style={{ height: 5, background: "#dddbd6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.ap}%`, background: "linear-gradient(90deg, #4a8a1a, #6a9d2a)", borderRadius: 3 }} />
                        </div>
                      </div>

                      <div style={{
                        display: "inline-block",
                        background: "rgba(106,157,42,0.12)",
                        border: "1px solid rgba(106,157,42,0.25)",
                        borderRadius: 4, padding: "2px 7px",
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                        color: "#4e7a1e", textTransform: "uppercase",
                        alignSelf: "flex-start",
                      }}>{item.delta}</div>
                    </div>
                  ))}
                </div>

                <InsightBox color="#6a9d2a">
                  <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.7 }}>
                    Harris converted a 3rd-generation industrial cattle operation into a 12-species regenerative grazing system. An independent life cycle analysis found the farm now sequesters more carbon than its beef produces, making it net carbon-negative. Revenue grew 20x while input costs fell 80%+, turning climate drawdown into a measurable business advantage. Source: Quantis / White Oak Pastures LCA, 2019.
                  </div>
                </InsightBox>
              </div>
            </FadeIn>

            {/* Indigo + crop insurance */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              <FadeIn delay={80}>
                <div style={{
                  padding: "24px 22px", background: "#eeece8",
                  borderRadius: 14, border: "1px solid rgba(106,157,42,0.18)",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 14 }}>
                    Indigo Ag · At Scale
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 52, color: "#6a9d2a", lineHeight: 1, marginBottom: 10 }}>8M+</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a12", marginBottom: 8 }}>acres enrolled in regenerative practices</div>
                  <div style={{ fontSize: 12.5, color: "#2a2a1e", lineHeight: 1.7, marginBottom: 14 }}>
                    2M+ tons of CO₂e credits verified. Proving that regenerative practices can scale from individual farms to entire commodity supply chains.
                  </div>
                  <InsightBox color="#6a9d2a">
                    <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>
                      Enrollment growth signals that climate-linked farm revenue is moving from niche experiment toward scalable transition finance.
                    </div>
                  </InsightBox>
                </div>
              </FadeIn>

              <FadeIn delay={160}>
                <div style={{
                  padding: "24px 22px",
                  background: "linear-gradient(135deg, #fdf0ee, #f5f4ee)",
                  borderRadius: 14, border: "1px solid rgba(192,57,43,0.25)",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#e74c3c", marginBottom: 14 }}>
                    Crop Insurance Crisis Signal
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 52, color: "#c0392b", lineHeight: 1, marginBottom: 10 }}>$44.4B</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a12", marginBottom: 8 }}>crop insurance paid out 2021–2023</div>
                  <div style={{ fontSize: 12.5, color: "#2a2a1e", lineHeight: 1.7, marginBottom: 14 }}>
                    Record $19.1B paid in 2022 alone. The US crop insurance program is now a leading indicator of soil and climate system failure — not a safety net.
                  </div>
                  <InsightBox color="#c0392b">
                    <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>
                      Claims are accelerating faster than premiums — the program is structurally underfunded and growing.
                    </div>
                  </InsightBox>
                </div>
              </FadeIn>
            </div>

            {/* Investment gap meter */}
            <FadeIn delay={160}>
              <FundingGapMeter />
            </FadeIn>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: FARM FINANCIAL STRESS
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "stress" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <TabIntro
              icon="/icons/siren.webp"
              headline="Conventional agriculture is in financial crisis — and the numbers are accelerating"
              sub="Record bankruptcies, collapsing farm income, and billion-dollar climate disasters every 18 days. This is not a bad year. It is a broken system."
              color="#c0392b"
            />

            {/* Urgency banner */}
            <FadeIn>
              <div style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #220a0a 0%, #160808 100%)",
                borderRadius: 12, border: "1px solid rgba(192,57,43,0.35)",
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 22, alignItems: "center",
              }}>
                <div style={{ textAlign: "center", minWidth: 100 }}>
                  <img src="/icons/bankruptcy.webp" alt="" style={{ width: 28, height: 28, marginBottom: 4, filter: "brightness(0) invert(1) opacity(0.55)" }} />
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 56, color: "#e74c3c", lineHeight: 1 }}>315</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, marginTop: 2 }}>BANKRUPTCIES</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>2025 (YTD)</div>
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
                    Chapter 12 farm bankruptcies surging — up 127% from 2023 low
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                    Conventional agriculture is financially failing. High input costs, rising debt loads, climate shocks, and falling commodity margins are colliding at once.
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Bankruptcy chart */}
            <FadeIn delay={80}>
              <div>
                <SectionHeader title="Chapter 12 Farm Bankruptcies (US)" sub="Annual filings. Source: US Courts, American Farm Bureau Federation." />
                <div style={{ background: "#eeece8", borderRadius: 14, padding: "24px 18px 14px", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <BankruptcyChart />
                </div>
              </div>
            </FadeIn>

            {/* 4 crisis stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              {[
                { val: "$624.7B", label: "Projected total US farm debt, 2026", sub: "USDA Economic Research Service", color: "#c0392b", accent: "rgba(192,57,43,0.22)", icon: "/icons/bank.webp" },
                { val: "-40%",   label: "Net farm income drop, 2022-2024",   sub: "Even as USDA subsidy payments increased", color: "#c0392b", accent: "rgba(192,57,43,0.2)", icon: "/icons/graph.webp" },
                { val: "140,000+", label: "Farms lost 2017-2022 Census",     sub: "Consolidation accelerating - small farms disappearing", color: "#e74c3c", accent: "rgba(231,76,60,0.18)", icon: "/icons/loss.webp" },
                { val: "+73%",   label: "Farm interest expenses above 2018", sub: "High rates hitting already-leveraged operations", color: "#e74c3c", accent: "rgba(231,76,60,0.18)", icon: "/icons/bankruptcy.webp" },
              ].map((c, i) => (
                <StatCard key={i} value={c.val} label={c.label} sub={c.sub} color={c.color} accent={c.accent} delay={i * 80} icon={c.icon} />
              ))}
            </div>

            {/* Disaster trend */}
            <FadeIn delay={200}>
              <div style={{ padding: "26px 24px", background: "#eeece8", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)" }}>
                <DisasterTrend />
              </div>
            </FadeIn>

            {/* Bridge to solution */}
            <FadeIn delay={240}>
              <div style={{
                padding: "24px 24px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 14,
                border: "1px solid rgba(106,157,42,0.3)",
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 20, alignItems: "center",
              }}>
                <IconBadge
                  icon="/icons/plant.webp"
                  size={24}
                  padding={12}
                  bg="rgba(106,157,42,0.12)"
                  border="1px solid rgba(106,157,42,0.22)"
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a12", marginBottom: 6 }}>
                    The same soil that caused this crisis is the solution
                  </div>
                  <div style={{ fontSize: 13, color: "#6a6a5a", lineHeight: 1.7 }}>
                    Every metric above — bankruptcies, debt, disasters — is driven by degraded soil. Regenerative management reverses all of them simultaneously. The financial case is as strong as the ecological one.
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: CLIMATE & YIELDS
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "yields" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TabIntro
              icon="/icons/weather.webp"
              headline="Climate change is already costing farmers yields — and the losses are compounding"
              sub="These are observed historical declines, not projections. Every degree of additional warming compounds each loss below - and the damage travels outward as tighter supply and higher food prices."
              color="#c0392b"
            />
            <div style={{
              marginTop: -2,
              fontSize: 13,
              color: "#6a6a5a",
              lineHeight: 1.65,
              maxWidth: 760,
            }}>
              When yields weaken and food inflation rises together, climate stress stops being just a farm problem and
              starts showing up as pressure on household food access.
            </div>
            <FadeIn>
              <SectionHeader
                title="Observed Crop Yield Losses"
                sub="Percentage decline attributed to warming trends over recent decades. Source: Lobell et al., 2011, Science."
              />
            </FadeIn>

            {/* Crop loss bars */}
            <FadeIn delay={60}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CROP_IMPACTS.map((c, i) => (
                  <div key={c.crop} style={{
                    display: "grid", gridTemplateColumns: "80px 1fr 100px",
                    alignItems: "center", gap: 16,
                    padding: "18px 20px", background: "#eeece8", borderRadius: 12,
                    border: "1px solid rgba(192,57,43,0.12)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <IconBadge icon={c.icon} size={18} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#2a2a1e" }}>{c.crop}</span>
                    </div>
                    <div style={{ background: "#f5f4ee", borderRadius: 6, height: 24, overflow: "hidden", border: "1px solid rgba(192,57,43,0.08)" }}>
                      <BarAnimated width={(c.loss / 25) * 100} color={c.color} delay={i * 120 + 200} height={24} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontFamily: "'Bebas Neue', Arial, sans-serif",
                        fontSize: 30, color: "#c0392b",
                      }}>−{c.loss}%</span>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "#7a7a6a", marginTop: 4, lineHeight: 1.6, paddingLeft: 4 }}>
                  Losses are observed actuals, not projections. Future warming will compound these declines.
                </div>
              </div>
            </FadeIn>

            {/* Regen buffer visual */}
            <FadeIn delay={80}>
              <RegenBuffer />
            </FadeIn>

            {/* 2024 commodity disruptions */}
            <FadeIn delay={100}>
              <div style={{
                padding: "26px 24px",
                background: "linear-gradient(135deg, #fdf0ee, #f5f4ee)",
                borderRadius: 14, border: "1px solid rgba(192,57,43,0.3)",
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#e74c3c", marginBottom: 18 }}>
                  2024 Commodity Price Collapse — Climate-Driven
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
                  {[
                    {
                      label: "Cocoa", icon: "/icons/inclined-chocolate-bar.webp",
                      stat: "$12,931/TON",
                      sub: "Price surge from West Africa crop failure — up from $2,500/ton",
                    },
                    {
                      label: "Crop Variance", icon: "/icons/weather.webp",
                      stat: "40%+",
                      sub: "of all yield variation driven by weather extremes (Edison Institute, 2024)",
                    },
                    {
                      label: "Global Losses", icon: "/icons/globe.webp",
                      stat: "$320B",
                      sub: "Total economic climate disaster losses 2024 — Munich Re record",
                    },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "18px 16px", background: "#f5f4ee",
                      borderRadius: 10, border: "1px solid rgba(192,57,43,0.12)",
                      display: "flex", flexDirection: "column",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <IconBadge icon={item.icon} size={18} />
                        <span style={{ fontSize: 11, color: "#e74c3c", letterSpacing: 1 }}>{item.label}</span>
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "clamp(28px, 3.2vw, 42px)", color: "#c0392b", lineHeight: 1, marginBottom: 10 }}>{item.stat}</div>
                      <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.55, marginTop: "auto" }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Future projections */}
            <FadeIn delay={160}>
              <div style={{ padding: "18px 20px", background: "#eeece8", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#7a7a6a", marginBottom: 14 }}>
                  Future Projections
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
                  {[
                    { stat: "−24%", label: "Maize yield decline by late century", source: "NASA" },
                    { stat: "+129%", label: "Global cereal price increase by 2050", source: "IPCC" },
                    { stat: "1.4–1.8 pts", label: "Added food inflation annually in North America by 2035", source: "Kotz et al., 2023" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      textAlign: "center", padding: "12px 10px",
                      background: "#f5f4ee", borderRadius: 10,
                      border: "1px solid rgba(192,57,43,0.12)",
                    }}>
                      <div style={{
                        fontFamily: "'Bebas Neue', Arial, sans-serif",
                        fontSize: "clamp(28px, 3.2vw, 42px)",
                        color: "#c0392b", lineHeight: 1, marginBottom: 6,
                      }}>{s.stat}</div>
                      <div style={{ fontSize: 12, color: "#2a2a1e", lineHeight: 1.45, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "#7a7a6a" }}>{s.source}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "10px 14px", background: "rgba(192,57,43,0.06)", borderLeft: "3px solid #c0392b", borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>🌡️</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a12" }}>Every 1°C of warming costs 554 trillion kilocalories</div>
                    <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>~120 kcal per person per day per degree. Hultgren et al., 2025 (Nature).</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        </TabTransition>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        maxWidth: 920, margin: "60px auto 0",
        padding: "24px 28px 32px",
        borderTop: "1px solid rgba(47,82,2,0.25)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Peer-Reviewed Sources</div>
            {[
              "LaCanne & Lundgren 2018 (PeerJ) — regen farm profitability",
              "Soil Health Institute 2021 — 100-farm economic study",
              "McKinsey 2024 — regenerative agriculture value projection",
              "Boston Consulting Group 2023 — long-term ROI analysis",
              "Jang et al. 2020 (Earth's Future) — fertilizer cost degradation",
              "Neff et al. 2021 (CU Boulder) — total soil cost accounting",
              "Lobell et al. 2011 — observed crop yield climate losses",
              "Jägermeyr et al. 2021 (Nature Food) — climate-crop modeling",
              "Kotz et al. 2023 — food inflation projections",
            ].map((s, i) => (
              <div key={i} style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.65, display: "flex", gap: 6 }}>
                <span style={{ color: "#2f5202", flexShrink: 0 }}>→</span>{s}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Institutional & Government</div>
            {[
              "Munich Re 2024 Annual Report — global total economic climate losses",
              "NOAA Billion-Dollar Disasters — disaster frequency data",
              "American Farm Bureau Federation — bankruptcy data",
              "US Courts Chapter 12 — farm filing statistics",
              "USDA Economic Research Service — farm debt projections",
              "Gabe Brown / NRCS — Brown's Ranch case study",
              "Quantis / White Oak Pastures — Life Cycle Assessment, 2019",
              "Indigo Ag 2023 — platform enrollment & carbon credits",
              "Edison Institute research — US crop variance & projections",
              "NASA / IPCC — future crop and price projections",
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
          <div>Pillar 2 · The Carbon Underground · Data current through 2025</div>
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
