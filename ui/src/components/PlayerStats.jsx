import { useState, useRef, useCallback } from "react";
import { NuiEvent } from "../hooks/NuiEvent";
import Fade from "../utils/fade";
import { useHudPosition } from "../providers/hudpositionprovider";

/* ==========================================================
   PlayerStats – Gradient-border status boxes (vertical layout)
   Placed next to the minimap on the right side.
   NO container background. Each box floats independently.
   statsCombined=true  → whole group drags together
   statsCombined=false → each stat drags individually
   ========================================================== */

// ===== SVG Icons =====
const Icons = {
  health: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  armor: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  ),
  hunger: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </svg>
  ),
  thirst: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
    </svg>
  ),
  oxygen: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M14.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3h2c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1H2v-2h9.5c1.65 0 3 1.35 3 3zM19 6.5C19 4.57 17.43 3 15.5 3S12 4.57 12 6.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S16.33 8 15.5 8H2v2h13.5C17.43 10 19 8.43 19 6.5zM18.5 11H2v2h16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H16v2h2.5c1.93 0 3.5-1.57 3.5-3.5S20.43 11 18.5 11z" />
    </svg>
  ),
  stress: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
  ),
};

// ===== Color configs =====
const STAT_COLORS = {
  health: {
    bright: "#ff3b5c",
    dark: "#4d0a16",
    glow: "rgba(255, 59, 92, 0.15)",
  },
  armor: {
    bright: "#00c2ff",
    dark: "#003b4d",
    glow: "rgba(0, 194, 255, 0.15)",
  },
  hunger: {
    bright: "#ff9f0a",
    dark: "#4d3000",
    glow: "rgba(255, 159, 10, 0.15)",
  },
  thirst: {
    bright: "#00c2ff",
    dark: "#003b4d",
    glow: "rgba(0, 194, 255, 0.15)",
  },
  oxygen: {
    bright: "#b4ff00",
    dark: "#364d00",
    glow: "rgba(180, 255, 0, 0.15)",
  },
  stress: {
    bright: "#e056fd",
    dark: "#421a4d",
    glow: "rgba(224, 86, 253, 0.15)",
  },
};

// ===== Single stat box with conic-gradient border =====
const StatBox = ({ icon, value, colors, size = 48 }) => {
  const pct = Math.max(0, Math.min(100, value));
  const fillDeg = (pct / 100) * 360;

  const borderGradient = `conic-gradient(
    from 225deg,
    ${colors.dark} 0deg,
    ${colors.dark} ${360 - fillDeg}deg,
    ${colors.bright} ${360 - fillDeg}deg,
    ${colors.bright} 360deg
  )`;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        padding: 2,
        borderRadius: 11,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Rotating conic gradient border */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: borderGradient,
          transition: "background 0.4s ease",
        }}
      />
      {/* Inner box */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#1c1c1c",
          borderRadius: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,

        }}
      >
        <div
          style={{
            color: colors.bright,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: `drop-shadow(0 0 4px ${colors.bright}40)`,
            opacity: pct > 0 ? 1 : 0.3,
            transition: "opacity 0.3s ease",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// ===== Draggable wrapper for individual stats (SEPARATE mode) =====
const DraggableStat = ({
  statKey,
  children,
  editMode,
  statsCombined,
  updatePosition,
  getPosition,
}) => {
  const startPosRef = useRef({ x: 0, y: 0 });
  const position = !statsCombined
    ? getPosition(statKey) || { x: 0, y: 0 }
    : { x: 0, y: 0 };

  const handleMouseDown = useCallback(
    (e) => {
      if (!editMode || statsCombined) return;
      e.preventDefault();
      e.stopPropagation();
      startPosRef.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (mv) => {
        const dx = mv.clientX - startPosRef.current.x;
        const dy = mv.clientY - startPosRef.current.y;
        startPosRef.current = { x: mv.clientX, y: mv.clientY };
        updatePosition(statKey, { x: dx, y: dy });
      };
      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editMode, statsCombined, updatePosition, statKey]
  );

  const isSeparate = !statsCombined;
  const transform =
    isSeparate && (position.x !== 0 || position.y !== 0)
      ? `translate(${position.x}px, ${position.y}px)`
      : undefined;

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        transform,
        cursor: isSeparate && editMode ? "move" : "default",
        outline:
          isSeparate && editMode
            ? "2px dashed rgba(249, 54, 57, 0.7)"
            : "none",
        outlineOffset: isSeparate && editMode ? "2px" : 0,
        zIndex: editMode ? 1000 : undefined,
      }}
    >
      {children}
    </div>
  );
};

// ===== Main Component =====
const PlayerStats = () => {
  const [status, setStatus] = useState({
    show: true,
    health: 100,
    armour: 100,
    hunger: 100,
    thirst: 100,
    oxygen: 100,
    stress: 0,
  });

  const startPos = useRef({ x: 0, y: 0 });
  const { editMode, statsCombined, updatePosition, getPosition } =
    useHudPosition();
  const containerPosition = getPosition("playerStats") || { x: 0, y: 0 };

  const handleStatus = (data) => {
    setStatus((prev) => ({
      ...prev,
      show: data.show !== undefined ? data.show : prev.show,
      health:
        data.health !== undefined ? Math.min(data.health, 100) : prev.health,
      armour: data.armour !== undefined ? data.armour : prev.armour,
      hunger: data.hunger !== undefined ? data.hunger : prev.hunger,
      thirst: data.thirst !== undefined ? data.thirst : prev.thirst,
      oxygen: data.oxygen !== undefined ? data.oxygen : prev.oxygen,
      stress: data.stress !== undefined ? data.stress : prev.stress,
    }));
  };

  NuiEvent("playerstatus", handleStatus);

  // Container drag (COMBINED mode only)
  const handleContainerMouseDown = useCallback(
    (e) => {
      if (!editMode || !statsCombined) return;
      e.preventDefault();
      e.stopPropagation();
      startPos.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (mv) => {
        const dx = mv.clientX - startPos.current.x;
        const dy = mv.clientY - startPos.current.y;
        startPos.current = { x: mv.clientX, y: mv.clientY };
        updatePosition("playerStats", { x: dx, y: dy });
      };
      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editMode, statsCombined, updatePosition]
  );

  const stats = [
    {
      key: "health",
      icon: Icons.health,
      value: status.health,
      colors: STAT_COLORS.health,
    },
    {
      key: "armor",
      icon: Icons.armor,
      value: status.armour,
      colors: STAT_COLORS.armor,
    },
    {
      key: "hunger",
      icon: Icons.hunger,
      value: status.hunger,
      colors: STAT_COLORS.hunger,
    },
    {
      key: "thirst",
      icon: Icons.thirst,
      value: status.thirst,
      colors: STAT_COLORS.thirst,
    },
    {
      key: "oxygen",
      icon: Icons.oxygen,
      value: status.oxygen,
      colors: STAT_COLORS.oxygen,
    },
    {
      key: "stress",
      icon: Icons.stress,
      value: status.stress,
      colors: STAT_COLORS.stress,
    },
  ];

  const BOX_SIZE = 34;

  const offsetTransform =
    containerPosition.x !== 0 || containerPosition.y !== 0
      ? `translate(${containerPosition.x}px, ${containerPosition.y}px)`
      : undefined;

  return (
    <Fade in={status.show}>
      <div
        className="nox-player-stats"
        onMouseDown={statsCombined ? handleContainerMouseDown : undefined}
        style={{
          position: "fixed",
          left: 245,
          bottom: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          transform: offsetTransform,
          cursor: editMode && statsCombined ? "move" : "default",
          outline:
            editMode && statsCombined
              ? "2px dashed rgba(249, 54, 57, 0.7)"
              : "none",
          outlineOffset: editMode && statsCombined ? "2px" : 0,
          zIndex: editMode ? 1000 : 100,
        }}
      >
        {stats.map((s) => (
          <DraggableStat
            key={s.key}
            statKey={`stats_${s.key}`}
            editMode={editMode}
            statsCombined={statsCombined}
            updatePosition={updatePosition}
            getPosition={getPosition}
          >
            <StatBox
              icon={s.icon}
              value={s.value}
              colors={s.colors}
              size={BOX_SIZE}
            />
          </DraggableStat>
        ))}
      </div>
    </Fade>
  );
};

export default PlayerStats;
