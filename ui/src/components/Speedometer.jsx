import { useState, useMemo } from "react";
import Fade from "../utils/fade";
import { NuiEvent } from "../hooks/NuiEvent";
import { useHudPosition } from "../providers/hudpositionprovider";

/* ============================================================
   Classic Car Dashboard Speedometer
   - Left: Tachometer (0-8 x1000 rpm)
   - Center: LCD Display (temp, fuel, tire pressure, gear, ODO)
   - Right: Speedometer (0-200 km/h)
   ============================================================ */

// ===== Pre-calculate static gauge geometry =====
const buildGaugeFace = (maxVal, majorStep, minorPerMajor) => {
  const cx = 160, cy = 160;
  const outerR = 142;
  const majorLen = 22;
  const minorLen = 12;
  const numberR = 108;
  const totalAngle = 240;

  const ticks = [];
  const numbers = [];

  for (let v = 0; v <= maxVal; v += majorStep) {
    const frac = v / maxVal;
    const deg = -120 + frac * totalAngle;
    const rad = (deg * Math.PI) / 180;
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    // Major tick
    ticks.push({
      x1: cx + outerR * s,
      y1: cy - outerR * c,
      x2: cx + (outerR - majorLen) * s,
      y2: cy - (outerR - majorLen) * c,
      major: true,
    });

    // Number label
    numbers.push({
      x: cx + numberR * s,
      y: cy - numberR * c,
      text: String(v),
    });

    // Minor ticks between this and next major
    if (v < maxVal) {
      const stepDeg = (majorStep / maxVal) * totalAngle;
      for (let j = 1; j < minorPerMajor; j++) {
        const mDeg = deg + (j / minorPerMajor) * stepDeg;
        const mRad = (mDeg * Math.PI) / 180;
        ticks.push({
          x1: cx + outerR * Math.sin(mRad),
          y1: cy - outerR * Math.cos(mRad),
          x2: cx + (outerR - minorLen) * Math.sin(mRad),
          y2: cy - (outerR - minorLen) * Math.cos(mRad),
          major: false,
        });
      }
    }
  }

  return { ticks, numbers };
};

// ===== SVG Gauge Component =====
const Gauge = ({ value, maxVal, majorStep, minorPerMajor, unitLabel, warnings }) => {
  const face = useMemo(
    () => buildGaugeFace(maxVal, majorStep, minorPerMajor),
    [maxVal, majorStep, minorPerMajor]
  );

  const clamped = Math.min(Math.max(0, value), maxVal);
  const needleAngle = -120 + (clamped / maxVal) * 240;

  return (
    <div style={gaugeWrapperStyle}>
      <svg viewBox="0 0 320 320" style={svgStyle}>
        {/* Tick marks */}
        {face.ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke="#fff"
            strokeWidth={t.major ? 2.5 : 1.2}
            strokeLinecap="round"
          />
        ))}

        {/* Number labels */}
        {face.numbers.map((n, i) => (
          <text
            key={i}
            x={n.x} y={n.y}
            fill="#fff"
            fontSize="19"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            style={gaugeFontStyle}
          >
            {n.text}
          </text>
        ))}

        {/* Needle shadow */}
        <line
          x1={160} y1={165}
          x2={160} y2={32}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={5}
          strokeLinecap="round"
          style={{
            transformOrigin: "160px 160px",
            transform: `rotate(${needleAngle}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        />
        {/* Needle */}
        <line
          x1={160} y1={160}
          x2={160} y2={30}
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
          style={{
            transformOrigin: "160px 160px",
            transform: `rotate(${needleAngle}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        />

        {/* Center cap */}
        <circle cx={160} cy={160} r={26} fill="#000" stroke="#444" strokeWidth={3} />
        <circle cx={160} cy={160} r={5} fill="#666" />

        {/* Unit label */}
        <text
          x={160} y={252}
          fill="#888"
          fontSize="11"
          textAnchor="middle"
          style={gaugeFontStyle}
        >
          {unitLabel}
        </text>
      </svg>

      {/* Warning indicator lights */}
      {warnings &&
        warnings.map((w, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...w.pos,
              fontSize: 10,
              fontWeight: "bold",
              fontFamily: "'Segoe UI', sans-serif",
              color: w.active ? w.color : "rgba(255,255,255,0.1)",
              textShadow: w.active ? `0 0 6px ${w.color}` : "none",
              transition: "color 0.3s, text-shadow 0.3s",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {w.label}
          </div>
        ))}
    </div>
  );
};

// ===== Top-Down Car Silhouette (SVG) =====
const CarSilhouette = () => (
  <svg viewBox="0 0 40 70" width={34} height={60} style={{ opacity: 0.35 }}>
    <rect x={8} y={5} width={24} height={60} rx={8} fill="none" stroke="#a0c0ff" strokeWidth={1.5} />
    <rect x={2} y={15} width={5} height={12} rx={2} fill="#a0c0ff" opacity={0.5} />
    <rect x={33} y={15} width={5} height={12} rx={2} fill="#a0c0ff" opacity={0.5} />
    <rect x={2} y={43} width={5} height={12} rx={2} fill="#a0c0ff" opacity={0.5} />
    <rect x={33} y={43} width={5} height={12} rx={2} fill="#a0c0ff" opacity={0.5} />
    <line x1={12} y1={20} x2={28} y2={20} stroke="#a0c0ff" strokeWidth={0.8} opacity={0.3} />
    <line x1={12} y1={50} x2={28} y2={50} stroke="#a0c0ff" strokeWidth={0.8} opacity={0.3} />
  </svg>
);

// ===== Center LCD Display =====
const CenterLCD = ({ data }) => {
  // Gear text
  const gearText = data.handbrake
    ? "P"
    : data.gear === 0
    ? "R"
    : data.speed < 2 && data.rpm < 0.25
    ? "N"
    : String(data.gear);

  // Fuel and engine temp percentages
  const fuelPct = Math.max(0, Math.min(100, data.fuel || 0));
  const tempPct = Math.max(0, Math.min(100, 100 - (data.engine || 100)));

  // Distance
  const distText = data.hasWaypoint
    ? data.unit
      ? `${(data.distance / 1609.34).toFixed(1)}mi`
      : `${Math.round(data.distance / 1000)}km`
    : "---";

  return (
    <div style={lcdContainerStyle}>
      {/* === Top: Temperature & Fuel bars === */}
      <div style={lcdTopStyle}>
        <div style={barGroupStyle}>
          <span style={barIconStyle}>🌡</span>
          <div style={barBgStyle}>
            <div
              style={{
                ...barFillStyle,
                width: `${tempPct}%`,
                background: tempPct > 60 ? "#ff6060" : "#a0c0ff",
              }}
            />
          </div>
        </div>
        <div style={barGroupStyle}>
          <span style={barIconStyle}>⛽</span>
          <div style={barBgStyle}>
            <div
              style={{
                ...barFillStyle,
                width: `${fuelPct}%`,
                background: fuelPct < 25 ? "#ff6060" : "#a0c0ff",
              }}
            />
          </div>
        </div>
      </div>

      {/* === Middle: Car silhouette === */}
      <div style={carStatusStyle}>
        <CarSilhouette />
      </div>

      {/* === Bottom: ODO + Status Indicators + Gear === */}
      <div style={lcdBottomStyle}>
        <div style={odoRowStyle}>
          <span>ODO</span>
          <span>
            {distText}
          </span>
        </div>

        {/* Status indicator row */}
        <div style={indicatorRowStyle}>
          {/* Left turn signal */}
          <span
            style={{
              ...indicatorDotStyle,
              color:
                data.indicatorLeft || data.warningLights
                  ? "#22c55e"
                  : "rgba(255,255,255,0.12)",
              animation:
                data.indicatorLeft || data.warningLights
                  ? "blink 0.5s infinite"
                  : "none",
            }}
          >
            ◀
          </span>

          {/* Seatbelt */}
          <span
            style={{
              ...indicatorDotStyle,
              fontSize: 10,
              color: !data.seatbelt ? "#ef4444" : "rgba(255,255,255,0.12)",
              animation: !data.seatbelt ? "blink 0.8s infinite" : "none",
            }}
          >
            ⊘
          </span>

          {/* Headlights */}
          <span
            style={{
              ...indicatorDotStyle,
              color:
                data.lights === 2
                  ? "#60a5fa"
                  : data.lights === 1
                  ? "#22c55e"
                  : "rgba(255,255,255,0.12)",
            }}
          >
            ●
          </span>

          {/* Engine status */}
          <span
            style={{
              ...indicatorDotStyle,
              color: data.engineOn ? "#22c55e" : "#ef4444",
            }}
          >
            ⚙
          </span>

          {/* Lock */}
          <span
            style={{
              ...indicatorDotStyle,
              color: data.locked ? "#22c55e" : "#f59e0b",
            }}
          >
            {data.locked ? "🔒" : "🔓"}
          </span>

          {/* Right turn signal */}
          <span
            style={{
              ...indicatorDotStyle,
              color:
                data.indicatorRight || data.warningLights
                  ? "#22c55e"
                  : "rgba(255,255,255,0.12)",
              animation:
                data.indicatorRight || data.warningLights
                  ? "blink 0.5s infinite"
                  : "none",
            }}
          >
            ▶
          </span>
        </div>

        {/* Gear display */}
        <div style={gearDisplayStyle}>{gearText}</div>
      </div>
    </div>
  );
};

// ===== Main Speedometer Component =====
const Speedometer = () => {
  const [vehicle, setVehicle] = useState({
    show: false,
    speed: 0,
    fuel: 100,
    rpm: 0,
    gear: 1,
    engine: 100,
    body: 100,
    unit: false,
    distance: 0,
    hasWaypoint: false,
    seatbelt: false,
    indicatorLeft: false,
    indicatorRight: false,
    warningLights: false,
    lights: 0,
    engineOn: false,
    locked: true,
    handbrake: false,
  });

  const { editMode } = useHudPosition();

  NuiEvent("speedometer", (data) => {
    setVehicle((prev) => ({ ...prev, ...data }));
  });

  // Tachometer warning indicators
  const tachoWarnings = [
    {
      label: "OIL",
      pos: { bottom: "40%", left: "18%" },
      active: vehicle.engine < 30,
      color: "#ff0000",
    },
    {
      label: "ENG",
      pos: { bottom: "28%", left: "32%" },
      active: vehicle.engine < 50,
      color: "#ffa500",
    },
    {
      label: "TEMP",
      pos: { bottom: "28%", right: "28%" },
      active: vehicle.engine < 20,
      color: "#ff0000",
    },
    {
      label: "BATT",
      pos: { bottom: "40%", right: "16%" },
      active: !vehicle.engineOn,
      color: "#ff0000",
    },
  ];

  // Speedometer warning indicators
  const speedoWarnings = [
    {
      label: "ABS",
      pos: { top: "36%", left: "30%" },
      active: false,
      color: "#ffa500",
    },
    {
      label: "BELT",
      pos: { top: "36%", right: "24%" },
      active: !vehicle.seatbelt,
      color: "#ff0000",
    },
    {
      label: "FUEL",
      pos: { bottom: "40%", right: "24%" },
      active: vehicle.fuel < 25,
      color: "#ffa500",
    },
    {
      label: "BRK",
      pos: { bottom: "28%", left: "34%" },
      active: vehicle.handbrake,
      color: "#ff0000",
    },
  ];

  return (
    <Fade in={vehicle.show || editMode}>
      <div style={dashboardStyle} className="nox-speedometer">
        {/* Tachometer */}
        <Gauge
          value={vehicle.rpm * 8}
          maxVal={8}
          majorStep={1}
          minorPerMajor={5}
          unitLabel="x1000r/min"
          warnings={tachoWarnings}
        />

        {/* Center LCD */}
        <CenterLCD data={vehicle} />

        {/* Speedometer */}
        <Gauge
          value={vehicle.speed}
          maxVal={200}
          majorStep={20}
          minorPerMajor={2}
          unitLabel={vehicle.unit ? "mph" : "km/h"}
          warnings={speedoWarnings}
        />
      </div>
    </Fade>
  );
};

// ===============================
// Style Definitions
// ===============================

const dashboardStyle = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 12px",
  background:
    "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)",
  borderRadius: "21px 21px 42px 42px",

  border: "2px solid #222",
  gap: 8,
  transform: "scale(1.1)",
  transformOrigin: "bottom right",
};

const gaugeWrapperStyle = {
  position: "relative",
  width: 154,
  height: 154,
  borderRadius: "50%",
  background: "#000",
  border: "4px solid #333",

  flexShrink: 0,
};

const svgStyle = {
  width: "100%",
  height: "100%",
  display: "block",
};

const gaugeFontStyle = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

// --- LCD Styles ---

const lcdContainerStyle = {
  width: 108,
  background: "#050505",
  border: "2px solid #222",
  borderRadius: 6,
  padding: "7px 6px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  fontFamily: "'Courier New', Courier, monospace",
  color: "#a0c0ff",

  gap: 3,
  minHeight: 136,
  flexShrink: 0,
};

const lcdTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "1px solid #333",
  paddingBottom: 6,
};

const barGroupStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
};

const barIconStyle = {
  fontSize: 11,
};

const barBgStyle = {
  width: 36,
  height: 3,
  background: "#222",
  borderRadius: 2,
  overflow: "hidden",
};

const barFillStyle = {
  height: "100%",
  borderRadius: 2,
  transition: "width 0.3s ease",
};

const carStatusStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  padding: "8px 0",
};

const pressureStyle = {
  position: "absolute",
  fontSize: 11,
  fontWeight: "bold",
  color: "#a0c0ff",
};

const lcdBottomStyle = {
  borderTop: "1px solid #333",
  paddingTop: 6,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const odoRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 10,
};

const indicatorRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 5,
  padding: "2px 0",
};

const indicatorDotStyle = {
  fontSize: 9,
  transition: "color 0.3s",
  userSelect: "none",
};

const gearDisplayStyle = {
  fontSize: 16,
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: 1,
  color: "#a0c0ff",
};

export default Speedometer;
