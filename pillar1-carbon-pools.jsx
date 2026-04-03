import { useState, useEffect, useRef, useMemo } from "react";

const POOLS = [
  { label: "Oceans", value: 38400, color: "#1a6b8a", pct: 90.8, image: "/carbon-stock-ocean.webp" },
  { label: "Soils (0-2 m)", value: 2500, color: "#8B5E3C", pct: 5.9, highlight: true, image: "/carbon-stock-soil.webp" },
  { label: "Atmosphere", value: 900, color: "#6a6a5a", pct: 2.1, image: "/carbon-stock-atmosphere.webp" },
  { label: "Vegetation", value: 560, color: "#6a9d2a", pct: 1.3, image: "/carbon-stock-vegetation.webp" },
];

const FLOWS = [
  { label: "Photosynthesis absorbs", value: 120, direction: "down", color: "#6a9d2a", desc: "Plants draw CO2 from air into roots. About 90% of land plants rely on mycorrhizal networks." },
  { label: "Soil respiration releases", value: 62, direction: "up", color: "#e67e22", desc: "Microbial decomposition returns soil organic matter to CO2 - a natural but accelerating process." },
  { label: "Fossil fuel emissions", value: 10, direction: "up", color: "#c0392b", desc: "The human imbalance: small in volume, enormous in consequence, disrupting a 10,000-year equilibrium." },
];

const DEBT_DATA = [
  { year: -10000, lost: 5 }, { year: -8000, lost: 10 }, { year: -6000, lost: 15 },
  { year: -4000, lost: 22 }, { year: -2000, lost: 30 }, { year: 0, lost: 35 },
  { year: 500, lost: 38 }, { year: 1000, lost: 42 }, { year: 1500, lost: 48 },
  { year: 1700, lost: 52 }, { year: 1800, lost: 60 }, { year: 1850, lost: 72 },
  { year: 1900, lost: 92 }, { year: 1950, lost: 108 }, { year: 1980, lost: 120 },
  { year: 2000, lost: 128 }, { year: 2017, lost: 133 },
];

const SEQUESTRATION = [
  { practice: "Compost (rangeland)", rate: 1.0, range: "0.8\u20131.2", color: "#2f5202", desc: "Applied compost feeds microbes; microbes build stable carbon aggregates", img: "/practice-compost.webp" },
  { practice: "Cover cropping", rate: 0.56, range: "0.32\u20130.88", color: "#3d6a10", desc: "Living roots deposit carbon year-round via exudates and necromass", img: "/practice-cover-crop.webp" },
  { practice: "AMP grazing", rate: 0.50, range: "0.3\u20132.29", color: "#4d821a", desc: "Adaptive multi-paddock grazing mimics bison herds; restores root density", img: "/practice-amp-grazing.webp" },
  { practice: "Organic systems", rate: 0.45, range: "0.3\u20130.6", color: "#5a8f22", desc: "Eliminates synthetic inputs that disrupt fungal networks; biological carbon cycling", img: "/practice-organic.webp" },
  { practice: "No-till (long-term)", rate: 0.30, range: "0.1\u20130.5", color: "#6a9d2a", desc: "Preserves fungal hyphae and soil aggregates built over decades", img: "/practice-no-till.webp" },
];

// â"€â"€â"€ Primitives â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function AnimatedNumber({ target, duration = 1600, prefix = "", suffix = "", decimals = 0 }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCurrent(eased * target);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return (
    <span ref={ref}>
      {prefix}{current.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
}

function BarAnimated({ width, color, delay = 0, height = 28 }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTimeout(() => setW(width), delay);
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width, delay]);
  return (
    <div ref={ref} style={{
      height,
      width: `${w}%`,
      background: `linear-gradient(90deg, ${color}dd, ${color}88)`,
      borderRadius: "0 6px 6px 0",
      transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
      minWidth: w > 0 ? 4 : 0,
      boxShadow: w > 0 ? `0 0 16px ${color}30` : "none",
      position: "relative",
    }}>
      {w > 20 && (
        <div style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          fontSize: height > 14 ? 11 : 9, color: "rgba(255,255,255,0.6)",
          fontFamily: "'Bebas Neue', Arial, sans-serif", letterSpacing: 0.5,
          pointerEvents: "none",
        }}>
          {Math.round(w)}%
        </div>
      )}
    </div>
  );
}

// â"€â"€â"€ Carbon Donut Chart â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function CarbonDonut() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const total = POOLS.reduce((s, p) => s + p.value, 0);
  const cx = 120, cy = 120, r = 95, ri = 62;
  let angle = -90;

  const segments = POOLS.map((pool) => {
    const sweep = (pool.value / total) * 360;
    const startA = angle;
    angle += sweep;
    const endA = angle;
    const toRad = (d) => (d * Math.PI) / 180;
    const midA = (startA + endA) / 2;
    const x1 = cx + r * Math.cos(toRad(startA));
    const y1 = cy + r * Math.sin(toRad(startA));
    const x2 = cx + r * Math.cos(toRad(endA));
    const y2 = cy + r * Math.sin(toRad(endA));
    const xi1 = cx + ri * Math.cos(toRad(startA));
    const yi1 = cy + ri * Math.sin(toRad(startA));
    const xi2 = cx + ri * Math.cos(toRad(endA));
    const yi2 = cy + ri * Math.sin(toRad(endA));
    const large = sweep > 180 ? 1 : 0;
    const d = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${large},0 ${xi1},${yi1} Z`;
    const labelR = r + 14;
    const lx = cx + labelR * Math.cos(toRad(midA));
    const ly = cy + labelR * Math.sin(toRad(midA));
    return { ...pool, d, lx, ly, midA, sweep };
  });

  const activePool = hovered !== null ? segments[hovered] : null;

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg viewBox="0 0 240 240" style={{ width: 210 }}>
          <defs>
            <filter id="soilGlow2">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {segments.map((seg, i) => {
            const isHovered = hovered === i;
            const scale = isHovered ? 1.06 : seg.highlight ? 1.03 : 1;
            return (
              <path
                key={i}
                d={seg.d}
                fill={seg.color}
                opacity={visible ? 1 : 0}
                filter={seg.highlight || isHovered ? "url(#soilGlow2)" : "none"}
                style={{
                  transition: `opacity 0.6s ease ${i * 150}ms, transform 0.2s ease`,
                  transform: `scale(${scale})`,
                  transformOrigin: `${cx}px ${cy}px`,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={ri} fill="#f0eee8" />
          {activePool ? (
            <>
              <text x={cx} y={cy - 16} textAnchor="middle" fill="#5a5a4a" fontSize={9} fontFamily="Arial, sans-serif" letterSpacing={1.5}>{activePool.label.toUpperCase()}</text>
              <text x={cx} y={cy + 8} textAnchor="middle" fill={activePool.color} fontSize={22} fontFamily="'Bebas Neue', Arial, sans-serif">{activePool.pct}%</text>
              <text x={cx} y={cy + 24} textAnchor="middle" fill="#7a7a6a" fontSize={9} fontFamily="Arial, sans-serif">{activePool.value.toLocaleString()} Gt C</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 16} textAnchor="middle" fill="#5a5a4a" fontSize={9} fontFamily="Arial, sans-serif" letterSpacing={1.5}>SOIL CARBON</text>
              <text x={cx} y={cy + 8} textAnchor="middle" fill="#8B5E3C" fontSize={24} fontFamily="'Bebas Neue', Arial, sans-serif">5.9%</text>
              <text x={cx} y={cy + 24} textAnchor="middle" fill="#7a7a6a" fontSize={9} fontFamily="Arial, sans-serif">of Earth's carbon</text>
            </>
          )}
        </svg>
        <div style={{
          position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
          fontSize: 9, color: "#7a7a6a", whiteSpace: "nowrap", letterSpacing: 1,
        }}>hover segments</div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 180 }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              opacity: visible ? 1 : 0,
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 8,
              background: hovered === i ? `${seg.color}14` : "#f1efea",
              border: `1px solid ${hovered === i ? seg.color + "55" : "rgba(0,0,0,0.08)"}`,
              transition: `background 0.2s ease, border 0.2s ease, opacity 0.5s ease ${i * 120 + 300}ms`,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{
              width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0,
              boxShadow: seg.highlight ? `0 0 8px ${seg.color}` : "none",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: "#2c2c22", fontWeight: seg.highlight ? 700 : 600 }}>
                {seg.label}
              </div>
              <div style={{ fontSize: 10, color: "#6f6f60" }}>{seg.pct}% of Earth's carbon</div>
            </div>
            <div style={{
              fontSize: 16, fontFamily: "'Bebas Neue', Arial, sans-serif",
              color: hovered === i ? seg.color : seg.highlight ? "#8B5E3C" : "#4e4f46",
              letterSpacing: 0.5, transition: "color 0.2s",
            }}>
              {seg.value.toLocaleString()} Gt C
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// â"€â"€â"€ Soil Cross-Section â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function SoilCrossSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const layers = [
    { label: "O Horizon", sub: "Organic debris and litter", depth: "0-5 cm", bg: "#3a2e1a", carbon: "5%", bar: 5 },
    { label: "A Horizon", sub: "Topsoil - primary carbon zone", depth: "5-30 cm", bg: "#2e1f0e", carbon: "40%", bar: 40, highlight: true },
    { label: "B Horizon", sub: "Subsoil - leached minerals", depth: "30-60 cm", bg: "#221608", carbon: "35%", bar: 35 },
    { label: "C Horizon", sub: "Parent material and deep roots", depth: "60-200 cm", bg: "#180f04", carbon: "20%", bar: 20 },
  ];

  return (
    <div ref={ref} style={{ overflow: "hidden", borderRadius: 14, border: "1px solid rgba(139,94,60,0.25)" }}>
      {/* Photo header */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img
          src="/soil-profile-cutout.webp"
          alt="Soil profile showing distinct horizons"
          style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(1.05)",
            transition: "opacity 0.9s ease, transform 1.4s ease",
            display: "block",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(17,17,8,0) 40%, rgba(46,31,14,0.98) 100%)",
        }} />
        <div style={{
          position: "absolute", bottom: 12, left: 14, right: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Soil Horizon Profile</div>
          <div style={{
            fontSize: 10, color: "rgba(139,94,60,0.9)", letterSpacing: 1,
            background: "rgba(139,94,60,0.15)", padding: "3px 10px", borderRadius: 4,
            border: "1px solid rgba(139,94,60,0.3)",
          }}>O / A / B / C</div>
        </div>
      </div>

      {layers.map((l, i) => (
        <div
          key={i}
          style={{
            background: l.bg,
            padding: "13px 15px",
            borderLeft: l.highlight ? "3px solid #8B5E3C" : "3px solid rgba(139,94,60,0.15)",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            alignItems: "center",
            gap: 10,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-12px)",
            transition: `opacity 0.5s ease ${i * 130}ms, transform 0.5s ease ${i * 130}ms`,
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Carbon bar background */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${l.bar}%`,
            background: l.highlight ? "rgba(139,94,60,0.12)" : "rgba(139,94,60,0.05)",
            transition: `width 1.1s ease ${i * 150 + 500}ms`,
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: l.highlight ? "#ffffff" : "#e7ddcc" }}>{l.label}</div>
            <div style={{ fontSize: 10, color: "rgba(232,224,208,0.72)", marginTop: 1 }}>{l.sub}</div>
          </div>
          <div style={{
            fontSize: 13, color: "#6a9d2a",
            fontFamily: "'Bebas Neue', Arial, sans-serif", letterSpacing: 1,
            textAlign: "right", position: "relative",
          }}>
            {l.carbon} <span style={{ fontSize: 9, color: "rgba(232,224,208,0.62)" }}>SOC</span>
          </div>
          <div style={{ fontSize: 9, color: "rgba(232,224,208,0.62)", textAlign: "right", position: "relative", whiteSpace: "nowrap" }}>
            {l.depth}
          </div>
        </div>
      ))}

      {/* Mycelium footer */}
      <div style={{ background: "#efece4", padding: "10px 16px", borderTop: "1px solid rgba(106,157,42,0.2)" }}>
        <svg viewBox="0 0 400 40" style={{ width: "100%", opacity: visible ? 1 : 0, transition: "opacity 1.2s ease 1s" }}>
          {[[20,10,80,32],[60,5,150,28],[100,8,200,35],[180,6,280,30],[220,12,320,38],[300,5,380,22],[150,3,250,25]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(106,157,42,0.35)" strokeWidth={0.95} />
          ))}
          {[40,90,150,200,280,340].map((x,i) => (
            <circle key={i} cx={x} cy={16+i%3*6} r={2} fill="rgba(106,157,42,0.52)" />
          ))}
          <rect x={132} y={25} width={136} height={12} rx={6} fill="rgba(106,157,42,0.12)" />
          <text x={200} y={34} textAnchor="middle" fill="#4f6d27" fontSize={8.8} fontWeight={700} fontFamily="Inter, Arial, sans-serif" letterSpacing={1.8}>
            MYCORRHIZAL NETWORK
          </text>
        </svg>
      </div>
    </div>
  );
}

// â"€â"€â"€ Mycelium Network â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function MyceliumNetwork() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 200 }}>
      <img
        src="/mycelium-network-photo.webp"
        alt="Mycorrhizal fungal network under microscopy"
        style={{
          width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
          display: "block", opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(1.04)",
          transition: "opacity 1.2s ease, transform 1.8s ease",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(13,16,8,0.9) 0%, rgba(13,16,8,0.15) 50%, rgba(13,16,8,0) 100%)",
      }} />
      <div style={{
        position: "absolute", bottom: 14, left: 18, right: 18,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(106,157,42,0.9)", textTransform: "uppercase" }}>
          Arbuscular mycorrhizal hyphae - 3D confocal reconstruction
        </div>
        <div style={{ fontSize: 9, color: "rgba(177,177,177,0.5)" }}>Hawkins et al., 2023</div>
      </div>
    </div>
  );
}

// â"€â"€â"€ Debt Chart â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function DebtChart() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const maxLost = 133;
  const chartW = 860, chartH = 340;
  const padL = 76, padR = 18, padT = 28, padB = 64;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const splitYear = 1800;
  const splitShare = 0.64;
  const splitX = padL + plotW * splitShare;
  const xTicks = [
    { year: -10000, label: "10k BCE" },
    { year: -5000, label: "5k BCE" },
    { year: 0, label: "0 CE" },
    { year: 1800, label: "1800" },
    { year: 1950, label: "1950" },
    { year: 2017, label: "2017" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const xScale = (year) => {
    if (year <= splitYear) {
      return padL + ((year - (-10000)) / (splitYear - (-10000))) * (splitX - padL);
    }
    return splitX + ((year - splitYear) / (2017 - splitYear)) * ((chartW - padR) - splitX);
  };
  const yScale = (val) => padT + plotH - (val / maxLost) * plotH;
  const endLabelY = yScale(78);

  const pathD = DEBT_DATA.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.year)},${yScale(d.lost)}`).join(" ");
  const areaD = pathD + ` L${xScale(2017)},${yScale(0)} L${xScale(-10000)},${yScale(0)} Z`;
  const totalLen = 1400;

  return (
    <svg ref={ref} viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#c0392b" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="60%" stopColor="#c0392b" />
          <stop offset="100%" stopColor="#e74c3c" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines */}
      {[0, 33, 66, 100, 133].map((v) => (
        <g key={v}>
          <line
            x1={padL} x2={chartW - padR} y1={yScale(v)} y2={yScale(v)}
            stroke={v === 0 ? "rgba(98,100,102,0.5)" : "rgba(98,100,102,0.15)"}
            strokeWidth={v === 0 ? 1.25 : 0.7} strokeDasharray={v === 0 ? "0" : "4,6"}
          />
          <text x={padL - 14} y={yScale(v) + 4} textAnchor="end" fill="#686859" fontSize={12} fontFamily="Arial, sans-serif" fontWeight={600}>{v}</text>
        </g>
      ))}

      {/* Y-axis title */}
      <text
        x={22} y={padT + plotH / 2} textAnchor="middle" fill="#545447" fontSize={12} fontFamily="Arial, sans-serif" fontWeight={700} letterSpacing={1.1}
        transform={`rotate(-90, 22, ${padT + plotH / 2})`}
      >CUMULATIVE LOSS (GT C)</text>

      {/* X-axis labels */}
      {xTicks.map((tick) => {
        const x = xScale(tick.year);
        const anchor = tick.year === -10000 ? "start" : tick.year === 2017 ? "end" : "middle";
        const tx = tick.year === -10000 ? x + 2 : tick.year === 2017 ? x - 2 : x;
        return (
        <g key={tick.year}>
          <line x1={x} x2={x} y1={padT + plotH} y2={padT + plotH + 6} stroke="rgba(98,100,102,0.32)" strokeWidth={1} />
          <text x={tx} y={chartH - 16} textAnchor={anchor} fill="#646457" fontSize={11.5} fontFamily="Arial, sans-serif" fontWeight={600}>
            {tick.label}
          </text>
        </g>
        );
      })}

      <text
        x={(padL + (chartW - padR)) / 2}
        y={chartH - 2}
        textAnchor="middle"
        fill="#545447"
        fontSize={12}
        fontFamily="Arial, sans-serif"
        fontWeight={700}
        letterSpacing={1.2}
      >
        YEAR / PERIOD
      </text>

      {/* BCE / CE divider */}
      <line x1={xScale(0)} x2={xScale(0)} y1={padT} y2={padT + plotH} stroke="rgba(98,100,102,0.25)" strokeWidth={1} strokeDasharray="3,5" />
      <text x={xScale(0) - 6} y={padT + 12} textAnchor="end" fill="rgba(98,100,102,0.58)" fontSize={8.5} fontFamily="Arial, sans-serif" fontWeight={700}>BCE</text>
      <text x={xScale(0) + 6} y={padT + 12} textAnchor="start" fill="rgba(98,100,102,0.58)" fontSize={8.5} fontFamily="Arial, sans-serif" fontWeight={700}>CE</text>

      {/* Industrial acceleration zone */}
      <rect
        x={xScale(1800)}
        y={padT}
        width={xScale(2017) - xScale(1800)}
        height={plotH}
        fill="rgba(231,76,60,0.06)"
      />
      <text
        x={xScale(1800) + 6}
        y={padT + 14}
        textAnchor="start"
        fill="rgba(192,57,43,0.55)"
        fontSize={9}
        fontFamily="Arial, sans-serif"
        fontWeight={700}
        letterSpacing={0.8}
      >
        INDUSTRIAL ACCELERATION
      </text>

      {/* Area fill */}
      <path d={areaD} fill="url(#debtGrad)" opacity={visible ? 1 : 0} style={{ transition: "opacity 1.8s ease 0.4s" }} />

      {/* Main animated line */}
      <path
        d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={totalLen} strokeDashoffset={visible ? 0 : totalLen}
        style={{ transition: "stroke-dashoffset 2.8s cubic-bezier(0.22,1,0.36,1)" }}
      />

      {/* Data points */}
      {visible && DEBT_DATA.map((d, i) => (
        <circle key={i} cx={xScale(d.year)} cy={yScale(d.lost)} r={2.5} fill="#c0392b" opacity={0.6}
          style={{ animation: `fadeIn 0.3s ease ${i * 80}ms both` }}
        />
      ))}

      {/* Annotations */}
      {visible && (
        <>
          {/* Industrial revolution marker */}
          <line x1={xScale(1800)} y1={yScale(60)} x2={xScale(1800)} y2={padT + plotH} stroke="rgba(231,76,60,0.35)" strokeWidth={1} strokeDasharray="3,4" />
          <circle cx={xScale(1800)} cy={yScale(60)} r={5} fill="#c0392b" />
          <circle cx={xScale(1800)} cy={yScale(60)} r={10} fill="#c0392b" opacity={0.15} />
          <rect x={xScale(1800) - 94} y={yScale(60) - 38} width={92} height={30} rx={5} fill="rgba(255,255,255,0.97)" stroke="rgba(192,57,43,0.3)" strokeWidth={1} />
          <text x={xScale(1800) - 48} y={yScale(60) - 23} textAnchor="middle" fill="#e74c3c" fontSize={10} fontFamily="Arial, sans-serif" fontWeight={700}>Industrial Era</text>
          <text x={xScale(1800) - 48} y={yScale(60) - 10} textAnchor="middle" fill="#5a5a4a" fontSize={9.25} fontFamily="Arial, sans-serif" fontWeight={600}>farming begins</text>

          {/* End point */}
          <circle cx={xScale(2017)} cy={yScale(133)} r={7} fill="#e74c3c" />
          <circle cx={xScale(2017)} cy={yScale(133)} r={14} fill="#e74c3c" opacity={0.18} />
          <line x1={xScale(2017)} y1={yScale(133) + 8} x2={xScale(2017) - 57} y2={endLabelY} stroke="rgba(231,76,60,0.45)" strokeWidth={1} strokeDasharray="3,3" />
          <rect x={xScale(2017) - 114} y={endLabelY} width={110} height={32} rx={5} fill="rgba(255,255,255,0.97)" stroke="rgba(231,76,60,0.4)" strokeWidth={1} />
          <text x={xScale(2017) - 59} y={endLabelY + 14} textAnchor="middle" fill="#e74c3c" fontSize={14} fontFamily="'Bebas Neue', Arial, sans-serif" letterSpacing={1}>133 GT C LOST</text>
          <text x={xScale(2017) - 59} y={endLabelY + 27} textAnchor="middle" fill="#5a5a4a" fontSize={9} fontFamily="Arial, sans-serif">= 488 Gt CO2 equivalent</text>
        </>
      )}
    </svg>
  );
}

// â"€â"€â"€ Recovery Arc â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function RecoveryArc() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const cx = 138, cy = 118, r = 92;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcPt = (pct, radius = r) => ({
    x: cx + radius * Math.cos(toRad(180 + pct * 180)),
    y: cy + radius * Math.sin(toRad(180 + pct * 180)),
  });
  const arc = (p0, p1, radius = r) => {
    const s = arcPt(p0, radius), e = arcPt(p1, radius);
    const large = (p1 - p0) > 0.5 ? 1 : 0;
    return `M${s.x},${s.y} A${radius},${radius} 0 ${large},1 ${e.x},${e.y}`;
  };

  const minPct = 42 / 133;
  const maxPct = 78 / 133;

  const minPt = arcPt(minPct);
  const maxPt = arcPt(maxPct);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <svg viewBox="0 0 290 180" style={{ width: "100%", maxWidth: 300 }}>
        <defs>
          <linearGradient id="arcFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d6a10" />
            <stop offset="100%" stopColor="#6a9d2a" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path d={arc(0, 1, r)} fill="none" stroke="rgba(98,100,102,0.14)" strokeWidth={20} strokeLinecap="round" />
        {/* Recoverable range */}
        <path d={arc(minPct, maxPct, r)}
          fill="none" stroke={visible ? "url(#arcFill)" : "transparent"}
          strokeWidth={20} strokeLinecap="round"
          style={{ transition: "stroke 0.6s ease 0.7s" }} />

        {/* Tick marks */}
        {visible && [0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const inner = arcPt(pct, r - 14);
          const outer = arcPt(pct, r + 14);
          return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(98,100,102,0.25)" strokeWidth={1} />;
        })}

        {/* Min/max markers */}
        {visible && (
          <>
            <circle cx={minPt.x} cy={minPt.y} r={5} fill="#3d6a10" stroke="#e8e6e0" strokeWidth={1.5} />
            <circle cx={maxPt.x} cy={maxPt.y} r={5} fill="#6a9d2a" stroke="#e8e6e0" strokeWidth={1.5} />
            {/* Min label */}
            <text x={minPt.x - 4} y={minPt.y + 22} textAnchor="middle" fill="#3d6a10" fontSize={10} fontFamily="'Bebas Neue', Arial, sans-serif">42 Gt</text>
            {/* Max label */}
            <text x={maxPt.x + 4} y={maxPt.y + 22} textAnchor="middle" fill="#6a9d2a" fontSize={10} fontFamily="'Bebas Neue', Arial, sans-serif">78 Gt</text>
          </>
        )}

        {/* Center text */}
        <text x={cx} y={cy - 34} textAnchor="middle" fill="#7a7a6a" fontSize={9} fontFamily="Arial, sans-serif" fontWeight={700} letterSpacing={1.4}>RECOVERABLE PORTION</text>
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#6a9d2a" fontSize={30} fontFamily="'Bebas Neue', Arial, sans-serif">42-78</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#8B5E3C" fontSize={12} fontFamily="'Bebas Neue', Arial, sans-serif" letterSpacing={1}>GT CARBON</text>
        <text x={cx} y={cy + 34} textAnchor="middle" fill="#6a6a5a" fontSize={10} fontFamily="Arial, sans-serif">highlighted green band = historic loss range (Lal 2004)</text>

        {/* 0% / 100% labels */}
        <text x={cx - r - 2} y={cy + 44} textAnchor="end" fill="#7a7a6a" fontSize={8} fontFamily="Arial, sans-serif">0%</text>
        <text x={cx + r + 2} y={cy + 44} textAnchor="start" fill="#7a7a6a" fontSize={8} fontFamily="Arial, sans-serif">100%</text>

        <text x={cx - r - 2} y={cy + 58} textAnchor="end" fill="#7a7a6a" fontSize={8.5} fontFamily="Arial, sans-serif">historic debt</text>
        <text x={cx + r + 2} y={cy + 58} textAnchor="start" fill="#7a7a6a" fontSize={8.5} fontFamily="Arial, sans-serif">full debt range</text>
      </svg>
      <div style={{ fontSize: 11.5, color: "#6a6a5a", marginTop: 10, lineHeight: 1.55 }}>
        The green segment shows the independent recovery opportunity range (Lal 2004, Science: 42–78 Gt C) within the 133 Gt C soil carbon debt estimated by Sanderman et al., 2017. This is the drawdown portion the site is focused on.
      </div>
    </div>
  );
}

// â"€â"€â"€ Stat Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function StatCard({ value, label, sub, color = "#6a9d2a", delay = 0, accent, icon, watermark = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        style={{
          padding: "26px 22px",
          background: hovered
            ? `linear-gradient(145deg, #e2e0da 0%, #eeece8 100%)`
            : "linear-gradient(145deg, #e8e6e0 0%, #f0eee8 100%)",
          borderRadius: 14,
          border: `1px solid ${hovered ? (accent || `${color}30`) : (accent || "rgba(106,157,42,0.12)")}`,
          position: "relative", overflow: "hidden",
          height: "100%", boxSizing: "border-box",
          transition: "all 0.22s ease",
          cursor: "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon && (
          <div style={{ fontSize: 22, marginBottom: 12, opacity: 0.85 }}>{icon}</div>
        )}
        <div style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "clamp(30px, 3.5vw, 50px)",
          color, lineHeight: 1, marginBottom: 10,
          transition: "color 0.2s",
        }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a12", marginBottom: 6 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#7a7a6a", lineHeight: 1.65 }}>{sub}</div>}
        {/* Bottom accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${color}00, ${color}${hovered ? "60" : "20"}, ${color}00)`,
          transition: "all 0.3s ease",
        }} />
      </div>
    </FadeIn>
  );
}

// â"€â"€â"€ Section Header â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function SectionHeader({ title, sub, step }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: sub ? 12 : 0 }}>
        {step && (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #2f5202, #4d821a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 16, color: "#ffffff",
            flexShrink: 0,
          }}>{step}</div>
        )}
        <div style={{
          background: "linear-gradient(90deg, #2f5202, #3d6a10)",
          padding: "9px 20px",
          borderRadius: step ? "8px 12px 12px 8px" : "2px 12px 12px 2px",
        }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: 21, letterSpacing: 2.5, color: "#ffffff",
            margin: 0, fontWeight: 400,
          }}>{title}</h2>
        </div>
      </div>
      {sub && <p style={{ fontSize: 13.5, color: "#6a6a5a", margin: 0, lineHeight: 1.65, paddingLeft: step ? 46 : 0 }}>{sub}</p>}
    </div>
  );
}

// â"€â"€â"€ Practice Bar â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function PracticeBar({ practice, rate, range, color, desc, rank, delay, img }) {
  const [hovered, setHovered] = useState(false);
  const maxRate = 1.0;
  const rankColors = ["#f4c430", "#b0b0b0", "#cd7f32", "#8B9BB4", "#6a6a5a"];
  const badgeColor = rankColors[rank - 1] || "#6a6a5a";

  return (
    <FadeIn delay={delay}>
      <div
        style={{
          padding: "20px 22px",
          background: hovered
            ? "linear-gradient(135deg, #e2e0da 0%, #161610 100%)"
            : "linear-gradient(135deg, #e8e6e0 0%, #f0eee8 100%)",
          borderRadius: 12,
          border: `1px solid ${hovered ? `${color}35` : "rgba(0,0,0,0.07)"}`,
          display: "grid",
          gridTemplateColumns: "44px 1fr auto 88px",
          gap: 16,
          alignItems: "start",
          transition: "all 0.2s ease",
          cursor: "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Rank badge */}
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: `linear-gradient(135deg, ${badgeColor}22, ${badgeColor}08)`,
          border: `1.5px solid ${badgeColor}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: 20, color: badgeColor, flexShrink: 0,
        }}>#{rank}</div>

        {/* Content */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a12", marginBottom: 4 }}>{practice}</div>
          <div style={{ fontSize: 12, color: "#6a6a5a", marginBottom: 10, lineHeight: 1.5 }}>{desc}</div>

          {/* Bar track */}
          <div style={{ background: "#eae8e2", borderRadius: 6, height: 10, overflow: "hidden", marginBottom: 6, position: "relative" }}>
            <BarAnimated width={(rate / maxRate) * 100} color={color} delay={delay + 200} height={10} />
          </div>

          {/* Range labels */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "#7a7a6a" }}>
              Range: <span style={{ color: "#8a8d90" }}>{range} Mg C/ha/yr</span>
            </div>
            <div style={{
              fontSize: 10, color: color,
              background: `${color}15`, padding: "2px 8px", borderRadius: 10,
            }}>
              {Math.round((rate / maxRate) * 100)}% of best
            </div>
          </div>
        </div>

        {/* Rate value */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: 38, color: hovered ? color : `${color}cc`, lineHeight: 1,
            transition: "color 0.2s",
          }}>{rate.toFixed(2)}</div>
          <div style={{ fontSize: 9, color: "#7a7a6a", letterSpacing: 0.5 }}>Mg C/ha/yr</div>
        </div>

        {/* Photo */}
        <div style={{
          width: 88, height: 88, borderRadius: 8, overflow: "hidden", flexShrink: 0,
          alignSelf: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <img src={img} alt={practice} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </div>
    </FadeIn>
  );
}

// â"€â"€â"€ Tab Transition â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function TabTransition({ children, id }) {
  const [mounted, setMounted] = useState(false);
  const prevId = useRef(id);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prevId.current !== id) {
      setVisible(false);
      const t = setTimeout(() => {
        prevId.current = id;
        setVisible(true);
        setMounted(m => !m); // trigger re-mount
      }, 160);
      return () => clearTimeout(t);
    }
  }, [id]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
    }}>
      {children}
    </div>
  );
}

// â"€â"€â"€ Carbon Balance Visual â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function CarbonBalance() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // photosynthesis ~120 Gt C/yr absorbed; ecosystem respiration ~114 Gt C/yr (soil 62 + other); fossil fuels ~10 Gt C/yr
  // net atmospheric CO2 accumulation ~6 Gt C/yr (Global Carbon Budget 2024)
  const absorbed = 120;
  const respired = 62;
  const fossil = 10;
  const netIn = absorbed;
  const netOut = respired + fossil;
  const maxVal = absorbed;

  return (
    <div ref={ref} style={{
      padding: "24px 22px",
      background: "#eeece8",
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.07)",
    }}>
      <div style={{ fontSize: 11, letterSpacing: 1.9, textTransform: "uppercase", color: "#666658", marginBottom: 18, fontWeight: 600 }}>
        Annual Carbon Budget - The Imbalance Explained
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 18, alignItems: "center" }}>
        {/* Absorb side */}
        <div>
          <div style={{ fontSize: 12, color: "#4c7d14", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>Absorbed by land</div>
          <div style={{
            background: "#f5f4ee", borderRadius: 8, overflow: "hidden", height: 42, marginBottom: 8,
            border: "1px solid rgba(106,157,42,0.22)",
          }}>
            <div style={{
              height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              width: visible ? "100%" : "0%",
              background: "linear-gradient(90deg, #2f5202, #6a9d2a)",
              borderRadius: 6, transition: "width 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s",
            }}>
              <span style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 26, color: "#fff", letterSpacing: 0.6 }}>
                120 Gt C/yr
              </span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#585848" }}>Photosynthesis (plant uptake)</div>
        </div>

        {/* vs divider */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 34,
            color: "#d94837", lineHeight: 1,
          }}>VS</div>
          <div style={{ fontSize: 10, color: "#6e6e60", letterSpacing: 1.1, fontWeight: 600 }}>IMBALANCE</div>
        </div>

        {/* Release side */}
        <div>
          <div style={{ fontSize: 12, color: "#b23528", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>Released to air</div>

          {/* Respiration bar */}
          <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8, marginBottom: 6 }}>
            <div style={{
              background: "linear-gradient(90deg, #7a1f1f, #c0392b)",
              borderRadius: 6,
              color: "#fff",
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: 24,
              letterSpacing: 0.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}>
              62 Gt
            </div>
            <div style={{
              background: "#f5f4ee",
              borderRadius: 6,
              overflow: "hidden",
              height: 30,
              border: "1px solid rgba(192,57,43,0.16)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                width: visible ? `${(respired / maxVal) * 100}%` : "0%",
                background: "linear-gradient(90deg, rgba(192,57,43,0.22), rgba(192,57,43,0.1))",
                transition: "width 1.4s cubic-bezier(0.22,1,0.36,1) 0.5s",
              }} />
              <div style={{ position: "relative", zIndex: 1, fontSize: 12.5, color: "#4f4f42", lineHeight: "30px", paddingLeft: 10, fontWeight: 600 }}>
                Soil respiration
              </div>
            </div>
          </div>

          {/* Fossil bar */}
          <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
            <div style={{
              background: "linear-gradient(90deg, #5a0f0f, #e74c3c)",
              borderRadius: 6,
              color: "#fff",
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: 24,
              letterSpacing: 0.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}>
              10 Gt
            </div>
            <div style={{
              background: "#f5f4ee",
              borderRadius: 6,
              overflow: "hidden",
              height: 30,
              border: "1px solid rgba(231,76,60,0.2)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                width: visible ? `${(fossil / maxVal) * 100}%` : "0%",
                background: "linear-gradient(90deg, rgba(231,76,60,0.28), rgba(231,76,60,0.12))",
                transition: "width 1.4s cubic-bezier(0.22,1,0.36,1) 0.9s",
              }} />
              <div style={{ position: "relative", zIndex: 1, fontSize: 12.5, color: "#4f4f42", lineHeight: "30px", paddingLeft: 10, fontWeight: 600 }}>
                Fossil fuels
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#595949", marginTop: 7, fontWeight: 600 }}>Total: 72 Gt C/yr released</div>
        </div>
      </div>

      {/* Net callout */}
      <div style={{
        marginTop: 18,
        padding: "12px 18px",
        background: "linear-gradient(90deg, rgba(231,76,60,0.08) 0%, rgba(14,15,10,0) 100%)",
        borderLeft: "3px solid #e74c3c",
        borderRadius: "0 8px 8px 0",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 34, color: "#e74c3c", lineHeight: 1, whiteSpace: "nowrap", flexShrink: 0 }}>~6 GT</div>
        <div style={{ fontSize: 13, color: "#4f4f42", lineHeight: 1.6 }}>
          net atmospheric CO2 accumulation per year (Global Carbon Budget 2024). Fossil fuels emit ~10 Gt C, land-use change ~1 Gt C; oceans absorb ~3 Gt C and land ~3 Gt C — leaving ~6 Gt accumulating in air. Soil management is the only mechanism capable of reversing this at scale.
        </div>
      </div>
    </div>
  );
}

// â"€â"€â"€ Scroll Progress Bar â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function ScrollProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setPct(docH > 0 ? (scrollTop / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 9999,
      background: "rgba(0,0,0,0.08)",
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: "linear-gradient(90deg, #3d6a10, #6a9d2a)",
        transition: "width 0.1s linear",
        boxShadow: "0 0 8px #6a9d2a80",
      }} />
    </div>
  );
}

// â"€â"€â"€ Insight Box â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function InsightBox({ children, color = "#6a9d2a", style: extraStyle = {} }) {
  return (
    <div style={{
      padding: "16px 20px",
      background: `linear-gradient(135deg, ${color}0d 0%, rgba(240,238,232,0.85) 100%)`,
      border: `1px solid ${color}28`,
      borderLeft: `3px solid ${color}`,
      borderRadius: "0 10px 10px 0",
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

// â"€â"€â"€ Main Export â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function CarbonPools() {
  const [activeTab, setActiveTab] = useState("pools");

  const tabs = [
    { id: "pools", label: "Carbon Pools", desc: "Where carbon lives" },
    { id: "microbiome", label: "Soil Microbiome", desc: "The living engine" },
    { id: "debt", label: "Carbon Debt", desc: "12,000 years of loss" },
    { id: "rebuild", label: "Rebuilding Carbon", desc: "The pathway forward" },
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

      {/* â"€â"€ Hero â"€â"€ */}
      <div style={{ position: "relative", minHeight: 400, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/soil-hands-golden.webp)",
          backgroundSize: "cover", backgroundPosition: "center 28%",
        }} />
        {/* Layered gradient for depth */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(14,15,10,0.82) 0%, rgba(14,15,10,0.66) 38%, rgba(14,15,10,0.34) 70%, rgba(14,15,10,0.18) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(14,15,10,0) 0%, rgba(14,15,10,0.75) 60%, #f5f4ee 100%)",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 34% 38%, rgba(38,52,15,0.18) 0%, rgba(38,52,15,0.08) 24%, rgba(38,52,15,0) 52%)",
        }} />

        <header style={{ position: "relative", zIndex: 1, padding: "64px 32px 44px", maxWidth: 920, margin: "0 auto" }}>
          <div style={{
            maxWidth: 860,
          }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
            color: "#6a9d2a", marginBottom: 18,
            padding: "5px 14px", border: "1px solid rgba(106,157,42,0.4)", borderRadius: 4,
            background: "rgba(106,157,42,0.08)",
          }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6a9d2a" }} />
            Pillar 1 - The Carbon Underground
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "clamp(36px, 5.4vw, 68px)",
            lineHeight: 0.95, margin: 0,
            color: "#ffffff",
            textShadow: "0 2px 40px rgba(0,0,0,0.9)",
            letterSpacing: 0.5,
          }}>
            Soil Carbon<br />
            <span style={{ color: "#6a9d2a" }}>Is Climate Infrastructure</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 15.5, lineHeight: 1.78, marginTop: 20, maxWidth: 600 }}>
            Soil stores <strong style={{ color: "#dce7cb" }}>~3x more carbon</strong> than the atmosphere. Human land use has stripped roughly 133 billion tons of carbon from the top two meters of global soils. Rebuilding that underground carbon is not just soil restoration. It is climate drawdown.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            marginTop: 24,
            maxWidth: 700,
          }}>
            {[
              {
                title: "Historic loss",
                stat: "133 Gt C",
                statLabel: "stripped from soil",
                text: "industrial agriculture stripped stored carbon from soil into the atmosphere.",
                accent: "#e74c3c",
              },
              {
                title: "Atmospheric burden",
                stat: "2,500 Gt C",
                statLabel: "stored in soils",
                text: "soil remains the planet's largest land-based carbon reservoir, with roughly three times as much carbon as the atmosphere.",
                accent: "#8B5E3C",
              },
              {
                title: "Biological drawdown",
                stat: "154-286 Gt CO2",
                statLabel: "recoverable range",
                text: "rebuilding soil carbon is one of the few scalable removal pathways we control.",
                accent: "#6a9d2a",
              },
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
                    fontSize: item.stat.length > 10 ? 24 : 30,
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

      {/* â"€â"€ Brand Strip (ticker) â"€â"€ */}
      <div style={{
        background: "linear-gradient(90deg, #1f3205 0%, #2f5202 50%, #1f3205 100%)",
        borderTop: "1px solid rgba(106,157,42,0.2)",
        borderBottom: "1px solid rgba(106,157,42,0.25)",
      }}>
        <div style={{
          maxWidth: 1020, margin: "0 auto", padding: "8px 22px",
          display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { label: "2,500 Gt C", sub: "in global soils" },
            { label: "~2.8x", sub: "more than atmosphere" },
            { label: "133 Gt C", sub: "stripped by farming" },
            { label: "13.12 Gt CO2e", sub: "moved by fungi annually" },
            { label: "154-286 Gt CO2", sub: "drawdown opportunity" },
          ].map((item, i) => (
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

      <div style={{ background: "rgba(245,244,238,0.97)", borderBottom: "1px solid rgba(47,82,2,0.25)", position: "sticky", top: 64, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <nav style={{
          maxWidth: 1020, margin: "0 auto", padding: "10px 28px",
          display: "flex", gap: 10, overflowX: "auto",
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "9px 12px 8px",
                minWidth: 160,
                textAlign: "left",
                background: activeTab === t.id ? "#eaf0dd" : "rgba(255,255,255,0.75)",
                border: activeTab === t.id ? "1px solid rgba(106,157,42,0.45)" : "1px solid rgba(0,0,0,0.08)",
                borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
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

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB: CARBON POOLS
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "pools" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

            {/* Explainer + Soil Cross-Section */}
            <FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
                <div>
                  <SectionHeader
                    title="Where Carbon Lives"
                    sub="Carbon moves constantly between four major reservoirs. Soil is the largest land-based pool and the one we control most directly."
                  />
                  <div style={{
                    padding: "24px 26px",
                    background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                    borderRadius: 14,
                    border: "1px solid rgba(106,157,42,0.28)",
                    marginTop: 8,
                  }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', Arial, sans-serif",
                      fontSize: 58, color: "#5a8c1e", lineHeight: 1, marginBottom: 10,
                    }}>~2.8x</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a12", marginBottom: 8 }}>
                      More carbon in soil than atmosphere
                    </div>
                    <div style={{ fontSize: 13, color: "#5a5a4a", lineHeight: 1.7 }}>
                      Every 1% increase in soil organic matter sequesters approximately <strong style={{ color: "#2f5202" }}>8.9 Gt of CO2</strong> globally.
                    </div>
                  </div>

                  {/* Quick fact row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                    {[
                      { val: "75%", label: "of terrestrial carbon stored underground" },
                      { val: "1B", label: "bacterial cells per gram of healthy soil" },
                    ].map((s, i) => (
                      <div key={i} style={{
                        padding: "15px 16px",
                        background: "linear-gradient(135deg, #eceae4 0%, #e3e1db 100%)",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}>
                        <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 34, color: "#5a8c1e", lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 11.5, color: "#68685a", marginTop: 5, lineHeight: 1.45 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <SoilCrossSection />
              </div>
            </FadeIn>

            {/* Pool Comparison Bars */}
            <FadeIn delay={80}>
              <div>
                <SectionHeader
                  title="Global Carbon Stocks"
                  sub="Gigatons of carbon (Gt C) stored in each reservoir. Soil dwarfs the atmosphere nearly 3-to-1 on land."
                />
                <div style={{
                  fontSize: 11, color: "#68685a", marginBottom: 16, lineHeight: 1.5,
                  padding: "8px 12px", background: "#eceae4", borderRadius: 6,
                  border: "1px solid rgba(0,0,0,0.08)",
                  display: "inline-block",
                }}>
                  Note: Land pools are scaled to soil maximum (2,500 Gt C). Oceans (38,400 Gt C) are shown as off-scale reference.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {POOLS.map((pool, i) => {
                    const LAND_MAX = 2500;
                    const isOcean = pool.label === "Oceans";
                    const barW = isOcean ? 100 : Math.min((pool.value / LAND_MAX) * 100, 100);
                    return (
                      <div key={pool.label} style={{
                        padding: "16px 20px",
                        background: pool.highlight ? "linear-gradient(135deg, #e5ecd2 0%, #efede7 100%)" : "#eeece8",
                        borderRadius: 10,
                        border: `1px solid ${pool.highlight ? "rgba(139,94,60,0.3)" : isOcean ? "rgba(26,107,138,0.22)" : "rgba(0,0,0,0.08)"}`,
                      }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 110px", gap: 18, alignItems: "center" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                  width: 12, height: 12, borderRadius: 3,
                                  background: pool.color,
                                  boxShadow: pool.highlight ? `0 0 8px ${pool.color}80` : "none",
                                  flexShrink: 0,
                                }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#202018" }}>
                                  {pool.label}
                                </span>
                                {pool.highlight && (
                                  <span style={{
                                    fontSize: 9, padding: "3px 10px",
                                    background: "linear-gradient(90deg, #2f5202, #3d6a10)",
                                    borderRadius: 10, color: "#ffffff", letterSpacing: 1.2,
                                  }}>LARGEST LAND POOL</span>
                                )}
                                {isOcean && (
                                  <span style={{
                                    fontSize: 10, color: "#5f7078",
                                    background: "rgba(26,107,138,0.1)", border: "1px solid rgba(26,107,138,0.2)",
                                    borderRadius: 999, padding: "2px 8px",
                                  }}>off-scale reference</span>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <span style={{
                                  fontSize: 11, color: "#6a6a5a",
                                  background: "#f5f4ee", padding: "2px 10px", borderRadius: 4,
                                }}>{pool.pct}% of Earth's carbon</span>
                                <span style={{
                                  fontFamily: "'Bebas Neue', Arial, sans-serif",
                                  fontSize: 36, color: pool.highlight ? "#8B5E3C" : "#58616a",
                                  lineHeight: 1,
                                }}>
                                  <AnimatedNumber target={pool.value} suffix=" Gt C" />
                                </span>
                              </div>
                            </div>
                            <div style={{
                              background: "#f5f4ee", borderRadius: 6, overflow: "hidden",
                              height: 22,
                              opacity: isOcean ? 0.86 : 1,
                              border: "1px solid rgba(0,0,0,0.05)",
                            }}>
                              <BarAnimated width={barW} color={pool.color} delay={i * 180} height={24} />
                            </div>
                          </div>
                          <div style={{
                            height: 82,
                            borderRadius: 10,
                            overflow: "hidden",
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "#f5f4ee",
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
                          }}>
                            <img
                              src={pool.image}
                              alt={`${pool.label} visual`}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Donut + stats grid */}
            <FadeIn delay={160}>
              <div style={{
                padding: "30px 28px",
                background: "linear-gradient(135deg, #eceae4 0%, #f5f4ee 100%)",
                borderRadius: 16,
                border: "1px solid rgba(106,157,42,0.2)",
                display: "grid",
                gridTemplateColumns: "1.15fr 0.85fr",
                gap: 28,
                alignItems: "start",
              }}>
                <CarbonDonut />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{
                    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                    color: "#6a6a5a", marginBottom: 4,
                  }}>Key Facts</div>
                  {[
                    { num: "75%", label: "Of all terrestrial carbon stored underground", color: "#6a9d2a" },
                    { num: "2,500", label: "Gigatons in global soils - top 2 meters only", color: "#8B5E3C" },
                    { num: "1B", label: "Bacterial cells per gram of healthy soil", color: "#6a9d2a" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, alignItems: "flex-start",
                      padding: "10px 0",
                      borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.08)",
                    }}>
                      <div style={{
                        fontFamily: "'Bebas Neue', Arial, sans-serif",
                        fontSize: "clamp(38px, 4vw, 56px)",
                        color: s.color, lineHeight: 0.95, flexShrink: 0, minWidth: 92,
                      }}>{s.num}</div>
                      <div style={{ fontSize: 13, color: "#4f4f42", lineHeight: 1.6, paddingTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Annual Carbon Flows */}
            <FadeIn delay={100}>
              <div>
                <SectionHeader
                  title="Annual Carbon Flows"
                  sub="Gigatons moving between pools each year. Photosynthesis and respiration are nearly balanced - fossil fuels are not."
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {FLOWS.map((f, i) => (
                    <FadeIn key={f.label} delay={i * 100}>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "56px 1fr auto",
                        gap: 16, padding: "16px 18px",
                        background: "#efede8",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.06)",
                        borderLeft: `4px solid ${f.color}`,
                        alignItems: "center",
                      }}>
                        {/* Direction badge */}
                        <div style={{
                          width: 56, height: 56, borderRadius: 12,
                          background: f.direction === "down" ? "rgba(106,157,42,0.14)" : "rgba(192,57,43,0.14)",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: 3,
                        }}>
                          <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 18, color: f.color, lineHeight: 1 }}>
                            {f.direction === "down" ? "IN" : "OUT"}
                          </div>
                          <div style={{ fontSize: 8, color: f.color, letterSpacing: 0.7, opacity: 0.85 }}>
                            {f.direction === "down" ? "LAND" : "AIR"}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a12", marginBottom: 4 }}>{f.label}</div>
                          <div style={{ fontSize: 11.5, color: "#6a6a5a", lineHeight: 1.55 }}>{f.desc}</div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{
                            fontFamily: "'Bebas Neue', Arial, sans-serif",
                            fontSize: 34, color: f.color, lineHeight: 1,
                          }}>
                            <AnimatedNumber target={f.value} />
                          </div>
                          <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 2 }}>Gt C / yr</div>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>

                {/* Carbon budget balance visual */}
                <FadeIn delay={320}>
                  <CarbonBalance />
                </FadeIn>

                {/* Mycorrhizal callout */}
                <FadeIn delay={480}>
                  <div style={{
                    marginTop: 16,
                    borderRadius: 12,
                    border: "1px solid rgba(106,157,42,0.3)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "170px 1fr",
                  }}>
                    <div style={{ position: "relative", minHeight: 120 }}>
                      <img
                        src="/mycelium-dark-nodes.webp"
                        alt="Mycorrhizal network"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to right, rgba(14,15,10,0) 55%, rgba(14,15,10,0.97) 100%)",
                      }} />
                    </div>
                    <div style={{ padding: "22px 22px", background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)" }}>
                      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 8 }}>
                        Mycorrhizal Fungi - Hawkins et al., 2023
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#6a9d2a", fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 30 }}>
                          <AnimatedNumber target={13.12} decimals={2} />
                        </span>
                        {" "}<span style={{ fontSize: 12, color: "#5a5a4a" }}>Gt CO2e channeled underground each year</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.65 }}>
                        Equal to <strong style={{ color: "#5a5a4a" }}>36%</strong> of all fossil fuel emissions - moved silently through a network stretching ~3x the Earth-Sun distance.
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB: SOIL MICROBIOME
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "microbiome" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Dramatic intro */}
            <FadeIn>
              <div style={{
                padding: "34px 32px 24px",
                background: "linear-gradient(135deg, #edf5db 0%, #e7efd4 100%)",
                borderRadius: 16,
                border: "1px solid rgba(106,157,42,0.3)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "url(/mycelium-network-photo.webp)",
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: 0.1,
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 14 }}>
                    The Hidden Universe Below
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(28px, 4.5vw, 52px)",
                    color: "#1a1a12", lineHeight: 1.05, marginBottom: 16,
                  }}>
                    A Teaspoon of Healthy Soil Contains<br />
                    <span style={{ color: "#6a9d2a" }}>More Organisms Than People on Earth</span>
                  </div>
                  <p style={{ color: "#2a2a1e", fontSize: 14, lineHeight: 1.75, maxWidth: 640, margin: "0 0 22px" }}>
                    The soil microbiome - bacteria, fungi, archaea, protozoa, and nematodes - is the engine of the carbon cycle.
                    Industrial farming has decimated it. Regenerative agriculture rebuilds it. The data is unambiguous.
                  </p>
                  <MyceliumNetwork />
                </div>
              </div>
            </FadeIn>

            {/* 3 big stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <StatCard
                value="1 Billion"
                label="Bacteria per gram of soil"
                sub="A single gram of healthy soil can contain hundreds of millions to a billion bacterial cells. The climate drawdown story depends on that biological workforce."
                color="#6a9d2a" delay={0} watermark={false}
              />
              <StatCard
                value="13.12 Gt"
                label="CO2e moved by mycorrhizal fungi"
                sub="Equal to 36% of annual fossil fuel emissions. Hawkins et al., 2023, Current Biology."
                color="#6a9d2a" delay={100} watermark={false}
              />
              <StatCard
                value="450M km"
                label="Mycelial network length"
                sub="About 3x the Earth-Sun distance. The Earth's original internet."
                color="#6a9d2a" delay={200} watermark={false}
              />
            </div>

            {/* Necromass â€" split layout */}
            <FadeIn delay={100}>
              <div style={{
                padding: "30px 26px",
                background: "linear-gradient(145deg, #efede8 0%, #f5f4ee 100%)",
                borderRadius: 14,
                border: "1px solid rgba(106,157,42,0.15)",
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 28, alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 10 }}>
                    LLNL Discovery - Microbial Necromass
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(42px, 5.5vw, 72px)",
                    color: "#1a1a12", lineHeight: 1, marginBottom: 12,
                  }}>Up to 50%</div>
                  <div style={{ fontSize: 14, color: "#2a2a1e", lineHeight: 1.75, marginBottom: 14 }}>
                    of all soil organic matter is <strong style={{ color: "#1a1a12" }}>microbial necromass</strong> - the accumulated bodies of dead microbes. Their cellular material persists as stable, long-term carbon storage.
                  </div>
                  <InsightBox color="#6a9d2a">
                    <div style={{ fontSize: 11, color: "#6a6a5a" }}>Source: Lawrence Livermore National Laboratory (LLNL)</div>
                  </InsightBox>
                </div>

                <div>
                  {/* Root hairs photo */}
                  <div style={{ marginBottom: 20, borderRadius: 10, overflow: "hidden", height: 100, position: "relative" }}>
                    <img
                      src="/root-hairs-soil.webp"
                      alt="Plant root hairs in soil"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,10,0.55) 0%, rgba(14,15,10,0) 60%)" }} />
                    <div style={{ position: "absolute", top: 10, left: 12, fontSize: 8, letterSpacing: 2, color: "rgba(106,157,42,0.9)", textTransform: "uppercase" }}>
                      Root Hair - Mycorrhizal Interface
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "#7a7a6a", marginBottom: 16, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    Soil organic matter composition
                  </div>
                  {[
                    { label: "Microbial necromass", pct: 50, color: "#6a9d2a" },
                    { label: "Plant-derived material", pct: 35, color: "#3d6a10" },
                    { label: "Other organic matter", pct: 15, color: "#7a7a6a" },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, color: "#2a2a1e" }}>{item.label}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: "'Bebas Neue', Arial, sans-serif" }}>{item.pct}%</span>
                      </div>
                      <div style={{ background: "#f5f4ee", borderRadius: 6, height: 10, overflow: "hidden" }}>
                        <BarAnimated width={item.pct} color={item.color} delay={i * 160} height={10} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Glomalin + No-till */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FadeIn delay={100}>
                <div style={{
                  padding: "26px 22px", background: "linear-gradient(145deg, #efede8 0%, #f5f4ee 100%)",
                  borderRadius: 12, border: "1px solid rgba(106,157,42,0.15)",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 12 }}>
                    Glomalin - Carbon's Glue
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 52, color: "#8B5E3C", lineHeight: 1, marginBottom: 10 }}>4-5%</div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75, marginBottom: 14 }}>
                    of all soil carbon is held by glomalin - a sticky glycoprotein secreted by mycorrhizal fungi. It glues soil particles into aggregates and persists for <strong style={{ color: "#1a1a12" }}>6-42 years</strong>.
                  </div>
                  <InsightBox color="#6a9d2a">
                    <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.5 }}>
                      Without fungal networks, soil loses structure. Compaction and erosion follow. Carbon escapes to the atmosphere.
                    </div>
                  </InsightBox>
                </div>
              </FadeIn>

              <FadeIn delay={180}>
                <div style={{
                  padding: "26px 22px", background: "linear-gradient(145deg, #efede8 0%, #f5f4ee 100%)",
                  borderRadius: 12, border: "1px solid rgba(106,157,42,0.15)",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 12 }}>
                    ORNL Study - No-Till vs. Conventional
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 52, color: "#6a9d2a", lineHeight: 1, marginBottom: 10 }}>+37%</div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75, marginBottom: 14 }}>
                    greater microbial biomass carbon in no-till fields vs. conventional tillage. Oak Ridge National Laboratory meta-analysis across <strong style={{ color: "#1a1a12" }}>137 studies</strong>.
                  </div>
                  <InsightBox color="#6a9d2a">
                    <div style={{ fontSize: 12, color: "#6a6a5a", lineHeight: 1.5 }}>
                      Fungi-to-bacteria ratio is a key indicator of soil health. Tillage shifts communities toward bacteria - less efficient at storing carbon.
                    </div>
                  </InsightBox>
                </div>
              </FadeIn>
            </div>

            {/* UC Davis result */}
            <FadeIn delay={160}>
              <div style={{
                padding: "30px 26px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 14,
                border: "1px solid rgba(106,157,42,0.3)",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 30, alignItems: "center",
              }}>
                <div style={{ textAlign: "center", minWidth: 120 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(52px, 7vw, 84px)",
                    color: "#6a9d2a", lineHeight: 1,
                  }}>+45%</div>
                  <div style={{ fontSize: 11, color: "#7a7a6a", marginTop: 4 }}>SOC gain</div>
                  <div style={{
                    marginTop: 10, padding: "4px 12px",
                    background: "rgba(106,157,42,0.1)", borderRadius: 20,
                    fontSize: 9, color: "#6a9d2a", letterSpacing: 1,
                  }}>8 YEARS</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 10 }}>
                    UC Davis - San Joaquin Valley - 8-Year Trial
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a12", marginBottom: 10 }}>
                    Soil organic carbon increased 45% in just 8 years
                  </div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75 }}>
                    Using regenerative cover cropping, compost application, and no-till in California's Central Valley. The same degraded soils the conventional agriculture industry declared "too far gone" responded decisively to biological management.
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Ecosystem services grid */}
            <FadeIn delay={240}>
              <div style={{ padding: "26px 22px", background: "linear-gradient(145deg, #efede8 0%, #f5f4ee 100%)", borderRadius: 14, border: "1px solid rgba(47,82,2,0.3)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6a9d2a", marginBottom: 20, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  What a Healthy Soil Microbiome Delivers
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { tag: "WATER", icon: "/icons/water.webp", title: "Water holding", desc: "Each 1% SOM increase stores 20,000 extra gallons per acre.", color: "rgba(26,106,170,0.18)" },
                    { tag: "NPK", icon: "/icons/grain.webp", title: "Nutrient cycling", desc: "Microbes mineralize nutrients, reducing synthetic fertilizer demand 40-50%.", color: "rgba(106,157,42,0.14)" },
                    { tag: "DEFENSE", icon: "/icons/warning.webp", title: "Disease suppression", desc: "Diverse microbial communities outcompete pathogens and reduce crop losses.", color: "rgba(106,157,42,0.14)" },
                    { tag: "STRUCT", icon: "/icons/networking.webp", title: "Soil structure", desc: "Fungal hyphae and glomalin bind aggregates and reduce compaction and erosion.", color: "rgba(139,94,60,0.18)" },
                    { tag: "C-SINK", icon: "/icons/growth.webp", title: "Carbon sequestration", desc: "Microbial necromass is a primary pathway for stable, long-term soil carbon.", color: "rgba(106,157,42,0.14)" },
                    { tag: "YIELD", icon: "/icons/plant.webp", title: "Yield resilience", desc: "High microbial diversity correlates with stronger drought resilience (USDA ARS).", color: "rgba(106,157,42,0.14)" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "15px 14px",
                      background: item.color,
                      borderRadius: 10,
                      border: "1px solid rgba(106,157,42,0.12)",
                    }}>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        minWidth: 54,
                        height: 22,
                        padding: "0 8px",
                        marginBottom: 8,
                        borderRadius: 999,
                        border: "1px solid rgba(47,82,2,0.25)",
                        background: "rgba(255,255,255,0.4)",
                        fontFamily: "'Bebas Neue', Arial, sans-serif",
                        fontSize: 13,
                        letterSpacing: 0.9,
                        color: "#3d6a10",
                      }}>
                        <img src={item.icon} alt="" style={{ width: 13, height: 13, filter: "brightness(0.3) sepia(1) saturate(4) hue-rotate(60deg)" }} />
                        {item.tag}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1a1a12", marginBottom: 6 }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: "#6a6a5a", lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB: SOIL CARBON DEBT
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "debt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Urgency banner */}
            <FadeIn>
              <div style={{
                padding: "22px 24px",
                background: "linear-gradient(135deg, #2b0707 0%, #3a0e0e 55%, #1f0606 100%)",
                borderRadius: 14, border: "1px solid rgba(231,76,60,0.35)",
                boxShadow: "0 8px 24px rgba(75,10,10,0.32)",
                display: "grid", gridTemplateColumns: "112px 1fr",
                gap: 18, alignItems: "center",
              }}>
                <div style={{
                  textAlign: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(231,76,60,0.25)",
                  borderRadius: 10,
                  padding: "10px 8px",
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(42px, 6vw, 70px)",
                    color: "#ff5b47", lineHeight: 1,
                  }}>133</div>
                  <div style={{ fontSize: 10, color: "#d4a9a0", letterSpacing: 1.4, marginTop: 2 }}>GIGATONS</div>
                  <div style={{ fontSize: 9, color: "#e5c5bf" }}>of carbon lost</div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff2ee", marginBottom: 6 }}>
                    Stripped from global soils over 12,000 years of human land use
                  </div>
                  <div style={{ fontSize: 13.5, color: "#f0d3cd", lineHeight: 1.7 }}>
                    488 Gt CO2 equivalent already in the atmosphere - legacy carbon that net zero alone does not remove.
                  </div>
                  <div style={{ fontSize: 11, color: "#d9b7b0", marginTop: 8 }}>
                    Source: Sanderman et al., 2017, <em>PNAS</em>.
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Chart */}
            <FadeIn delay={100}>
              <div>
                <SectionHeader
                  title="12,000 Years of Soil Carbon Loss"
                  sub="Cumulative soil carbon lost from human land use (Gt C, top 2 m). The acceleration from industrial agriculture is unmistakable."
                />
                <div style={{
                  background: "linear-gradient(145deg, #f1efe9 0%, #f6f4ef 100%)",
                  borderRadius: 14,
                  padding: "22px 20px 16px",
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}>
                  <DebtChart />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={140}>
              <InsightBox color="#c0392b">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e74c3c", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
                  The TCU 2.0 Thesis
                </div>
                <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75 }}>
                  <strong style={{ color: "#1a1a12" }}>Net zero stops the bleeding. Drawdown heals the wound.</strong>{" "}
                  This 488 Gt CO2 is already in the atmosphere. Returning even part of it to soil is why biological systems matter to climate strategy.
                </div>
              </InsightBox>
            </FadeIn>

            {/* 3 crisis stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { val: "133 Gt C", label: "Total soil carbon debt", sub: "488 Gt CO2 equivalent - about 12x annual global emissions", color: "#c0392b", accent: "rgba(192,57,43,0.25)" },
                { val: "50-70%", label: "Original carbon now gone", sub: "From cultivated soils worldwide since agriculture began", color: "#c0392b", accent: "rgba(192,57,43,0.2)" },
                { val: "154-286 Gt CO2", label: "Biologically recoverable", sub: "Roughly 4-7 years of current CO2 emissions if returned to soil", color: "#6a9d2a", accent: "rgba(106,157,42,0.22)" },
              ].map((c, i) => (
                <StatCard key={i} value={c.val} label={c.label} sub={c.sub} color={c.color} accent={c.accent} delay={i * 100} watermark={false} />
              ))}
            </div>

            <FadeIn delay={120}>
              <div style={{
                padding: "22px 24px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 14,
                border: "1px solid rgba(106,157,42,0.28)",
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 12 }}>
                  Remaining Carbon Budget Context
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {[
                    { val: "235 Gt CO2", label: "1.5C budget", sub: "about 6 years at current emissions" },
                    { val: "585 Gt CO2", label: "1.7C budget", sub: "about 14 years at current emissions" },
                    { val: "1,110 Gt CO2", label: "2.0C budget", sub: "about 27 years at current emissions" },
                  ].map((item) => (
                    <div key={item.label} style={{
                      padding: "16px 14px",
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: 10,
                      border: "1px solid rgba(106,157,42,0.14)",
                    }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 30, lineHeight: 1, color: "#1a1a12", marginBottom: 6 }}>
                        {item.val}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a12", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.5 }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#6a6a5a", lineHeight: 1.6, marginTop: 12 }}>
                  Source frame: Global Carbon Budget 2024 / 2025. The recoverable soil-carbon range shown above is large enough to matter at carbon-budget scale, which is why the drawdown framing belongs in the public story.
                </div>
              </div>
            </FadeIn>

            {/* Biome conversion */}
            <FadeIn delay={160}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#7a7a6a", marginBottom: 16 }}>
                  SOC Loss by Biome Conversion - Wei et al., 2014, <em style={{ textTransform: "none" }}>Scientific Reports</em>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { val: "52%", label: "Temperate forest", arrow: "converted to agriculture", color: "#c0392b" },
                    { val: "41%", label: "Tropical forest", arrow: "converted to agriculture", color: "#c0392b" },
                    { val: "31%", label: "Boreal forest", arrow: "converted to agriculture", color: "#e74c3c" },
                  ].map((c, i) => (
                    <div key={i} style={{
                      padding: "22px 18px", background: "#eeece8",
                      borderRadius: 12, border: "1px solid rgba(192,57,43,0.18)",
                      position: "relative", overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute", bottom: -10, right: 4,
                        fontFamily: "'Bebas Neue', Arial, sans-serif",
                        fontSize: 68, color: "rgba(192,57,43,0.04)",
                        lineHeight: 1, userSelect: "none",
                      }}>{c.val}</div>
                      <div style={{
                        fontFamily: "'Bebas Neue', Arial, sans-serif",
                        fontSize: "clamp(34px, 3.5vw, 48px)",
                        color: c.color, lineHeight: 1, marginBottom: 8,
                      }}>{c.val}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a12", marginBottom: 4 }}>{c.label}</div>
                      <div style={{
                        fontSize: 10, color: "#7a7a6a",
                        background: "rgba(192,57,43,0.08)", padding: "3px 10px",
                        borderRadius: 4, display: "inline-block",
                      }}>{">"} {c.arrow}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Recovery â€" arc + text */}
            <FadeIn delay={240}>
              <div style={{
                padding: "30px 26px",
                background: "linear-gradient(135deg, #edf5db 0%, #f5f4ee 100%)",
                borderRadius: 14,
                border: "1px solid rgba(106,157,42,0.3)",
                display: "grid",
                gridTemplateColumns: "300px 1fr",
                gap: 32, alignItems: "center",
              }}>
                <RecoveryArc />
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 12 }}>
                    The Opportunity - Historic Loss Range 42 to 78 Gt C
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a12", marginBottom: 12 }}>
                    A significant share of degraded soils retain biological sink capacity
                  </div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75, marginBottom: 18 }}>
                    Independent estimates place the biologically recoverable opportunity at <strong style={{ color: "#1a1a12" }}>42–78 Gt C</strong> (Lal 2004, Science). Against a 133 Gt C soil carbon debt, that is roughly one-third to three-fifths of the total legacy loss.
                  </div>
                  <div style={{
                    marginBottom: 18,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.58)",
                    border: "1px solid rgba(106,157,42,0.18)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#5b5b4d",
                    lineHeight: 1.65,
                  }}>
                    Read the arc like this: the <strong style={{ color: "#3d6a10" }}>green band</strong> shows the independent recovery range (Lal 2004, Science: 42–78 Gt C) against the full 133 Gt soil carbon debt estimated by Sanderman et al., 2017. That is the portion this site treats as drawdown opportunity.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { val: "42 Gt C", label: "Low historic loss estimate (Lal 2004)", color: "#3d6a10" },
                      { val: "78 Gt C", label: "High historic loss estimate (Lal 2004)", color: "#6a9d2a" },
                    ].map((s, i) => (
                      <div key={i} style={{
                        padding: "14px 16px",
                        background: "#e8e6e0", borderRadius: 8,
                        border: `1px solid ${s.color}44`,
                      }}>
                        <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 5, letterSpacing: 0.5 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB: REBUILDING CARBON
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "rebuild" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Before / After aerial comparison */}
            <FadeIn>
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(106,157,42,0.2)", position: "relative" }}>
                <div style={{
                  padding: "10px 18px",
                  background: "#eeece8",
                  borderBottom: "1px solid rgba(0,0,0,0.07)",
                  fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "#7a7a6a",
                }}>
                  The Difference Regenerative Management Makes - Aerial View
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 260 }}>
                  {/* Before */}
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img
                      src="/before-after-aerial.webp"
                      alt="Tilled bare soil - conventional"
                      style={{ width: "200%", height: "100%", objectFit: "cover", objectPosition: "0% center", display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(60,20,10,0.28)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(14,15,10,0) 65%, rgba(255,255,255,0.82) 100%)" }} />
                    <div style={{ position: "absolute", top: 14, left: 14 }}>
                      <div style={{
                        background: "rgba(192,57,43,0.92)", padding: "4px 14px", borderRadius: 6,
                        fontSize: 10, fontWeight: 700, color: "#1a1a12", letterSpacing: 2, textTransform: "uppercase",
                      }}>Before</div>
                    </div>
                    <div style={{
                      position: "absolute", bottom: 14, left: 14,
                      background: "rgba(255,255,255,0.90)", padding: "10px 14px", borderRadius: 8,
                      border: "1px solid rgba(192,57,43,0.2)",
                    }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e74c3c" }}>Conventional tillage</div>
                      <div style={{ fontSize: 10, color: "#6a6a5a", marginTop: 3 }}>Bare soil - carbon escaping</div>
                    </div>
                  </div>
                  {/* After */}
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img
                      src="/before-after-cover-crop.webp"
                      alt="Living cover crop - regenerative"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "80% center", display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(10,30,5,0.18)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(14,15,10,0) 65%, rgba(255,255,255,0.82) 100%)" }} />
                    <div style={{ position: "absolute", top: 14, right: 14 }}>
                      <div style={{
                        background: "rgba(47,82,2,0.92)", padding: "4px 14px", borderRadius: 6,
                        fontSize: 10, fontWeight: 700, color: "#1a1a12", letterSpacing: 2, textTransform: "uppercase",
                      }}>After</div>
                    </div>
                    <div style={{
                      position: "absolute", bottom: 14, right: 14,
                      background: "rgba(255,255,255,0.90)", padding: "10px 14px", borderRadius: 8,
                      border: "1px solid rgba(106,157,42,0.2)",
                      textAlign: "right",
                    }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#6a9d2a" }}>Cover cropped</div>
                      <div style={{ fontSize: 10, color: "#6a6a5a", marginTop: 3 }}>Living roots building carbon</div>
                    </div>
                  </div>
                </div>
                {/* Center divider */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0, left: "50%", width: 2,
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(0,0,0,0.07))",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }} />
              </div>
            </FadeIn>

            <FadeIn>
              <SectionHeader
                title="Carbon Sequestration by Practice"
                sub="Measured rates of soil carbon gain (Mg C/ha/year, top 30 cm). Ranked by scientific consensus on average effectiveness."
              />
            </FadeIn>

            {/* Practice ranking */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SEQUESTRATION.map((s, i) => (
                <PracticeBar
                  key={s.practice}
                  practice={s.practice}
                  rate={s.rate}
                  range={s.range}
                  color={s.color}
                  desc={s.desc}
                  rank={i + 1}
                  delay={i * 70}
                  img={s.img}
                />
              ))}
            </div>

            {/* Rodale Institute trial */}
            <FadeIn delay={180}>
              <div style={{ padding: "30px 26px", background: "#eeece8", borderRadius: 14, border: "1px solid rgba(106,157,42,0.2)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#7a7a6a", marginBottom: 20 }}>
                  Rodale Institute - 34-Year Farming Systems Trial (1981-2015)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
                  {[
                    { sys: "Organic-Manure System", val: 61.9, color: "#6a9d2a", max: 70 },
                    { sys: "Conventional System", val: 53.3, color: "#7a7a6a", max: 70 },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "20px 18px", background: "#f5f4ee", borderRadius: 10,
                      border: `1px solid ${i === 0 ? "rgba(106,157,42,0.22)" : "rgba(255,255,255,0.06)"}`,
                    }}>
                      <div style={{ fontSize: 11, color: item.color, marginBottom: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>{item.sys}</div>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 46, color: item.color, lineHeight: 1, marginBottom: 12 }}>
                        {item.val} <span style={{ fontSize: 18 }}>Mg C/ha</span>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.07)", borderRadius: 4, height: 10, overflow: "hidden" }}>
                        <BarAnimated width={(item.val / item.max) * 100} color={item.color} delay={i * 200 + 400} height={10} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delta callout */}
                <div style={{
                  padding: "16px 20px", background: "#edf5db",
                  borderRadius: 10, borderLeft: "3px solid #6a9d2a",
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
                }}>
                  {[
                    { val: "+16%", label: "more soil carbon" },
                    { val: "-45%", label: "less energy used" },
                    { val: "-40%", label: "fewer emissions" },
                    { val: "+31%", label: "higher drought yields" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: 26, color: "#6a9d2a", lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 5 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: "#2a2a1e", lineHeight: 1.65, marginTop: 14 }}>
                  Rodale's long-run result is climate evidence as much as farming evidence: the same system delivered <strong style={{ color: "#1a1a12" }}>lower emissions and higher drought yields</strong> from the same soil intervention.
                </div>
              </div>
            </FadeIn>

            {/* MSU Warning */}
            <FadeIn delay={220}>
              <InsightBox color="#c0392b">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e74c3c", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
                  Michigan State University - 30-Year Finding
                </div>
                <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75 }}>
                  A single tillage pass on never-farmed soil reduces soil aggregation to levels equivalent to{" "}
                  <strong style={{ color: "#1a1a12" }}>50+ years of continuous tillage</strong>. The underground architecture built by fungi and roots over centuries is destroyed in hours.
                </div>
                <div style={{ fontSize: 10, color: "#7a7a6a", marginTop: 8 }}>MSU Extension</div>
              </InsightBox>
            </FadeIn>

            {/* Cover crop opportunity */}
            <FadeIn delay={280}>
              <div style={{
                padding: "34px 30px",
                background: "linear-gradient(135deg, #edf5db 0%, #edf5db 100%)",
                borderRadius: 14,
                border: "1px solid rgba(106,157,42,0.3)",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 32, alignItems: "center",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "url(/before-after-cover-crop.webp)",
                  backgroundSize: "cover", backgroundPosition: "right center",
                  opacity: 0.1,
                }} />
                <div style={{ textAlign: "center", position: "relative", minWidth: 120 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "clamp(48px, 5.5vw, 76px)",
                    color: "#6a9d2a", lineHeight: 1,
                  }}>107M</div>
                  <div style={{ fontSize: 11, color: "#7a7a6a", marginTop: 5 }}>MT CO2e / yr</div>
                  <div style={{
                    marginTop: 12, padding: "5px 14px",
                    background: "rgba(106,157,42,0.12)",
                    border: "1px solid rgba(106,157,42,0.25)",
                    borderRadius: 20, fontSize: 9,
                    color: "#6a9d2a", letterSpacing: 1.5,
                  }}>US CORN ACRES</div>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a9d2a", marginBottom: 10 }}>
                    If all US corn acres adopted cover crops
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: "#1a1a12", marginBottom: 12 }}>
                    107 million metric tons of CO2e sequestered annually
                  </div>
                  <div style={{ fontSize: 13.5, color: "#2a2a1e", lineHeight: 1.75 }}>
                    Equivalent to removing roughly <strong style={{ color: "#1a1a12" }}>25 million passenger vehicles</strong> from the road each year. Without changing a single farm's output. Without new technology. The bottleneck is adoption - and that is exactly the gap The Edison Institute is positioned to close.
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        </TabTransition>
      </main>

      {/* â"€â"€ Footer â"€â"€ */}
      <footer style={{
        maxWidth: 920, margin: "60px auto 0",
        padding: "24px 28px 32px",
        borderTop: "1px solid rgba(47,82,2,0.25)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              Peer-Reviewed Sources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Sanderman et al. 2017 (PNAS) — global soil carbon debt",
                "Hawkins et al. 2023 (Current Biology) — mycorrhizal flux",
                "Zomer et al. 2017 (Scientific Reports) — SOC stocks",
                "Wei et al. 2014 (Scientific Reports) — biome conversion losses",
                "Lal 2004 (Science) — soil carbon sequestration potential",
                "Lorenz 2025 (SSSA Journal) — management practices",
                "Joshi et al. 2023 (Agronomy Journal) — cover cropping",
                "Ryals & Silver 2013 — compost rangeland carbon",
              ].map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.65, display: "flex", gap: 6 }}>
                  <span style={{ color: "#2f5202", flexShrink: 0 }}>→</span>{s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#2f5202", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              Institutional Research
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Lawrence Livermore National Laboratory — microbial necromass",
                "Oak Ridge National Laboratory — no-till microbial biomass meta-analysis (137 studies)",
                "UC Davis — San Joaquin Valley 8-year regenerative trial",
                "Michigan State University Extension — tillage aggregate destruction",
                "Rodale Institute — 34-Year Farming Systems Trial (1981–2015)",
                "USDA ARS — drought resilience & microbial diversity",
                "FAO & IPCC — global land use emissions",
              ].map((s, i) => (
                <div key={i} style={{ fontSize: 10, color: "#7a7a6a", lineHeight: 1.65, display: "flex", gap: 6 }}>
                  <span style={{ color: "#2f5202", flexShrink: 0 }}>→</span>{s}
                </div>
              ))}
            </div>
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
          <div>Pillar 1 · The Carbon Underground · Data current through 2025</div>
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

