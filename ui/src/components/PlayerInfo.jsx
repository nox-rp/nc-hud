import { useState, useRef, useCallback } from "react";
import { NuiEvent } from "../hooks/NuiEvent";
import Fade from "../utils/fade";
import { useHudPosition } from "../providers/hudpositionprovider";
import { useTheme } from "../providers/themeprovider";

/* ==========================================================
   PlayerInfo – Right-side info panel (Orbit Studios style)
   Shows server name, stats, player ID, job & gang cards
   ========================================================== */

// ===== SVG Icons =====
const Icons = {
  users: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  dollar: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z" />
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
    </svg>
  ),
  gang: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4c1.4 0 2.8 1.1 2.8 2.5S13.4 10 12 10s-2.8-1.1-2.8-2.5S10.6 5 12 5zm4 12H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  ),
};

// ===== Helpers =====
const formatMoney = (amount) => {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(1) + "K";
  return amount.toLocaleString();
};

// ===== Draggable section wrapper (for SEPARATE mode) =====
const DraggableSection = ({
  posKey,
  children,
  editMode,
  infoCombined,
  updatePosition,
  getPosition,
  style = {},
}) => {
  const startPosRef = useRef({ x: 0, y: 0 });
  const position = !infoCombined
    ? getPosition(posKey) || { x: 0, y: 0 }
    : { x: 0, y: 0 };

  const handleMouseDown = useCallback(
    (e) => {
      if (!editMode || infoCombined) return;
      e.preventDefault();
      e.stopPropagation();
      startPosRef.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (mv) => {
        const dx = mv.clientX - startPosRef.current.x;
        const dy = mv.clientY - startPosRef.current.y;
        startPosRef.current = { x: mv.clientX, y: mv.clientY };
        updatePosition(posKey, { x: dx, y: dy });
      };
      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editMode, infoCombined, updatePosition, posKey]
  );

  const isSeparate = !infoCombined;
  const transform =
    isSeparate && (position.x !== 0 || position.y !== 0)
      ? `translate(${position.x}px, ${position.y}px)`
      : undefined;

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        ...style,
        transform,
        cursor: isSeparate && editMode ? "move" : "default",
        outline:
          isSeparate && editMode
            ? "2px dashed rgba(249, 54, 57, 0.7)"
            : "none",
        outlineOffset: isSeparate && editMode ? "2px" : 0,
      }}
    >
      {children}
    </div>
  );
};

// ===== Main Component =====
const PlayerInfo = () => {
  const [info, setInfo] = useState({
    show: true,
    serverId: 1,
    serverName: "NOX CORE",
    time: "18:24",
    job: "Unemployed",
    jobGrade: "",
    gang: "",
    gangGrade: "",
    cash: 0,
    bank: 0,
    playerCount: 0,
    maxPlayers: 48,
  });

  const startPos = useRef({ x: 0, y: 0 });
  const { isDark } = useTheme();
  const { editMode, infoCombined, updatePosition, getPosition } =
    useHudPosition();
  const containerPosition = getPosition("playerInfo") || { x: 0, y: 0 };

  const handleInfo = (data) => {
    setInfo((prev) => ({
      ...prev,
      show: data.show !== undefined ? data.show : prev.show,
      serverId: data.serverId ?? prev.serverId,
      serverName: data.serverName ?? prev.serverName,
      time: data.time ?? prev.time,
      job: data.job ?? prev.job,
      jobGrade: data.jobGrade ?? prev.jobGrade,
      gang: data.gang ?? prev.gang,
      gangGrade: data.gangGrade ?? prev.gangGrade,
      cash: data.cash ?? prev.cash,
      bank: data.bank ?? prev.bank,
      playerCount: data.playerCount ?? prev.playerCount,
      maxPlayers: data.maxPlayers ?? prev.maxPlayers,
    }));
  };
  NuiEvent("playerinfo", handleInfo);

  // Container drag (COMBINED mode)
  const handleContainerMouseDown = useCallback(
    (e) => {
      if (!editMode || !infoCombined) return;
      e.preventDefault();
      e.stopPropagation();
      startPos.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (mv) => {
        const dx = mv.clientX - startPos.current.x;
        const dy = mv.clientY - startPos.current.y;
        startPos.current = { x: mv.clientX, y: mv.clientY };
        updatePosition("playerInfo", { x: dx, y: dy });
      };
      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editMode, infoCombined, updatePosition]
  );

  const offsetTransform =
    containerPosition.x !== 0 || containerPosition.y !== 0
      ? `translate(${containerPosition.x}px, ${containerPosition.y}px)`
      : undefined;

  // ── Theme-aware colors ──
  const cardBg = isDark
    ? "rgba(40, 40, 40, 0.85)"
    : "rgba(255, 255, 255, 0.88)";
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const subText = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const statText = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";

  return (
    <Fade in={info.show}>
      <div
        className="nox-player-info"
        onMouseDown={infoCombined ? handleContainerMouseDown : undefined}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
          fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
          userSelect: "none",
          transform: offsetTransform,
          cursor: editMode && infoCombined ? "move" : "default",
          outline:
            editMode && infoCombined
              ? "2px dashed rgba(249, 54, 57, 0.7)"
              : "none",
          outlineOffset: editMode && infoCombined ? "2px" : 0,
          zIndex: editMode ? 1000 : 100,
        }}
      >
        {/* ── Top: Server name + Stats row ── */}
        <DraggableSection
          posKey="info_server"
          editMode={editMode}
          infoCombined={infoCombined}
          updatePosition={updatePosition}
          getPosition={getPosition}
          style={{ textAlign: "right" }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: textColor,
              textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
              marginBottom: 4,
            }}
          >
            {info.serverName}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 14,
              fontSize: 15,
              fontWeight: 600,
              color: statText,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {Icons.users}
              <span>
                {info.playerCount}/{info.maxPlayers}
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {Icons.dollar}
              <span>${formatMoney(info.cash)}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {Icons.bank}
              <span>${formatMoney(info.bank)}</span>
            </span>
          </div>
        </DraggableSection>

        {/* ── Middle: ID bar + Profile avatar ── */}
        <DraggableSection
          posKey="info_time"
          editMode={editMode}
          infoCombined={infoCombined}
          updatePosition={updatePosition}
          getPosition={getPosition}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          {/* ID Bar */}
          <div
            style={{
              background: cardBg,
              padding: "8px 12px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 40,
            }}
          >
            {/* ID Badge */}
            <div
              style={{
                backgroundColor: "#e0e0e0",
                color: "#000",
                padding: "2px 10px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              ID {info.serverId}
            </div>
            {/* Time */}
            <div
              style={{
                color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {info.time}
            </div>
          </div>


        </DraggableSection>

        {/* ── Bottom: Info cards ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {/* Job Card */}
          <DraggableSection
            posKey="info_job"
            editMode={editMode}
            infoCombined={infoCombined}
            updatePosition={updatePosition}
            getPosition={getPosition}
          >
            <div
              style={{
                background: cardBg,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                minWidth: 180,
              }}
            >
              <div
                style={{
                  padding: "8px 15px",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: textColor,
                  }}
                >
                  {info.job}
                </div>
                <div
                  style={{ fontSize: 11, color: subText, fontWeight: 600 }}
                >
                  {info.jobGrade || "Employee"}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 5,
                  borderRadius: 10,
                  background: "rgba(52, 152, 219, 0.3)",
                  color: "#3498db",

                }}
              >
                {Icons.briefcase}
              </div>
            </div>
          </DraggableSection>

          {/* Gang Card */}
          <DraggableSection
            posKey="info_bank"
            editMode={editMode}
            infoCombined={infoCombined}
            updatePosition={updatePosition}
            getPosition={getPosition}
          >
            <div
              style={{
                background: cardBg,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                minWidth: 180,
              }}
            >
              <div
                style={{
                  padding: "8px 15px",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: textColor,
                  }}
                >
                  {info.gang || "No Gang"}
                </div>
                <div
                  style={{ fontSize: 11, color: subText, fontWeight: 600 }}
                >
                  {info.gangGrade || "Unaffiliated"}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 5,
                  borderRadius: 10,
                  background: "rgba(230, 126, 34, 0.3)",
                  color: "#e67e22",

                }}
              >
                {Icons.gang}
              </div>
            </div>
          </DraggableSection>
        </div>
      </div>
    </Fade>
  );
};

export default PlayerInfo;
