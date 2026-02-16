import { useState, useRef, useCallback } from "react";
import { createStyles } from "@mantine/emotion";
import { NuiEvent } from "../hooks/NuiEvent";
import Fade from "../utils/fade";
import { useHudPosition } from "../providers/hudpositionprovider";
import { useTheme } from "../providers/themeprovider";

// SVG icon definitions
const Icons = {
  server: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ),
  time: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  ),
  job: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>
    </svg>
  ),
};

// Format function
const formatMoney = (amount) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

const useStyles = createStyles(() => ({
  container: {
    position: 'fixed',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    background: 'rgba(18, 20, 24, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
  },
  icon: {
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(180, 185, 195, 0.9)',
    flexShrink: 0,
  },
  text: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(230, 233, 238, 0.9)',
    letterSpacing: 0.3,
    whiteSpace: 'nowrap',
  },
  serverNum: {
    color: '#00e0ff',
  },
  time: {
    color: '#a8e6cf',
  },
  job: {
    color: '#ffd93d',
  },
  cash: {
    color: '#6bcf63',
  },
  bank: {
    color: '#64b5f6',
  },
}));

// Info item component (drag individually based on infoCombined)
const InfoItem = ({ id, icon, text, colorClass, classes, isDark, editMode, infoCombined, updatePosition, getPosition }) => {
  const startPos = useRef({ x: 0, y: 0 });
  const position = getPosition(id) || { x: 0, y: 0 };

  // Only allow individual drag when infoCombined is false
  const handleMouseDown = useCallback((e) => {
    if (!editMode || infoCombined) return;
    e.preventDefault();
    e.stopPropagation();
    startPos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      updatePosition(id, { x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [editMode, infoCombined, updatePosition, id]);

  // Apply individual position if infoCombined is false
  const itemStyle = !infoCombined ? {
    transform: `translate(${position.x}px, ${position.y}px)`,
    cursor: editMode ? 'move' : 'default',
    outline: editMode ? `2px dashed ${isDark ? 'rgba(249, 54, 57, 0.7)' : 'rgba(249, 54, 57, 0.8)'}` : 'none',
    outlineOffset: editMode ? '2px' : 0,
    zIndex: editMode ? 1000 : 100,
  } : {};

  return (
    <div 
      className={classes.item}
      onMouseDown={handleMouseDown}
      style={{
        ...itemStyle,
        background: isDark ? 'rgba(18, 20, 24, 0.75)' : 'rgba(240, 242, 245, 0.9)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className={classes.icon} style={{ color: isDark ? 'rgba(180, 185, 195, 0.9)' : 'rgba(80, 85, 95, 0.9)' }}>{icon}</div>
      <span className={`${classes.text} ${colorClass}`}>{text}</span>
    </div>
  );
};

// combined: statInfoCombined (bundle STATS/INFO) - passed from Hud.jsx
const PlayerInfo = ({ combined = false }) => {
  const [info, setInfo] = useState({
    show: true,
    serverId: 1,
    time: '18:24',
    job: 'Unemployed',
    cash: 0,
    bank: 0,
  });
  const startPos = useRef({ x: 0, y: 0 });
  const { classes } = useStyles();
  const { isDark } = useTheme();
  const { editMode, infoCombined, updatePosition, getPosition } = useHudPosition();
  
  const containerPosition = getPosition("playerInfo") || { x: 0, y: 0 };

  const handleInfo = (data) => {
    setInfo((prev) => ({
      ...prev,
      show: data.show !== undefined ? data.show : prev.show,
      serverId: data.serverId !== undefined ? data.serverId : prev.serverId,
      time: data.time !== undefined ? data.time : prev.time,
      job: data.job !== undefined ? data.job : prev.job,
      cash: data.cash !== undefined ? data.cash : prev.cash,
      bank: data.bank !== undefined ? data.bank : prev.bank,
    }));
  };

  NuiEvent("playerinfo", handleInfo);

  // Drag entire container when infoCombined is true
  const handleContainerMouseDown = useCallback((e) => {
    if (!editMode || !infoCombined || combined) return;  // If combined(statInfoCombined) is true, handled in Hud.jsx
    e.preventDefault();
    e.stopPropagation();
    startPos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      updatePosition("playerInfo", { x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [editMode, infoCombined, combined, updatePosition]);

  // Info item definitions
  const infoItems = [
    { id: 'info_server', icon: Icons.server, text: `#${info.serverId}`, colorClass: classes.serverNum },
    { id: 'info_time', icon: Icons.time, text: info.time, colorClass: classes.time },
    { id: 'info_job', icon: Icons.job, text: info.job, colorClass: classes.job },
    { id: 'info_cash', icon: Icons.cash, text: formatMoney(info.cash), colorClass: classes.cash },
    { id: 'info_bank', icon: Icons.bank, text: formatMoney(info.bank), colorClass: classes.bank },
  ];

  // If combined(statInfoCombined) is true, background/drag handled in Hud.jsx wrapper
  // If combined is false, use own container
  if (combined) {
    // If statInfoCombined is true: return items only without background
    return (
      <Fade in={info.show}>
        <div style={{ display: 'flex', gap: 8 }}>
          {infoItems.map((item) => (
            <InfoItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              text={item.text}
              colorClass={item.colorClass}
              classes={classes}
              isDark={isDark}
              editMode={editMode}
              infoCombined={infoCombined}
              updatePosition={updatePosition}
              getPosition={getPosition}
            />
          ))}
        </div>
      </Fade>
    );
  }

  // If statInfoCombined is false: use own container (top center)
  const baseTransform = 'translateX(-50%)';
  const offsetTransform = (containerPosition.x !== 0 || containerPosition.y !== 0) 
    ? `${baseTransform} translate(${containerPosition.x}px, ${containerPosition.y}px)` 
    : baseTransform;

  return (
    <Fade in={info.show}>
      <div 
        className={`${classes.container} nox-player-info`}
        onMouseDown={handleContainerMouseDown}
        style={{
          transform: offsetTransform,
          cursor: (editMode && infoCombined) ? 'move' : 'default',
          outline: (editMode && infoCombined) ? `2px dashed ${isDark ? 'rgba(249, 54, 57, 0.7)' : 'rgba(249, 54, 57, 0.8)'}` : 'none',
          outlineOffset: (editMode && infoCombined) ? '2px' : 0,
          zIndex: editMode ? 1000 : undefined,
          // Transparent container background if infoCombined is false
          background: infoCombined 
            ? (isDark
              ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 242, 245, 0.92) 100%)')
            : 'transparent',
          border: infoCombined ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          boxShadow: infoCombined ? '0 8px 24px rgba(0, 0, 0, 0.65)' : 'none',
          padding: infoCombined ? 10 : 0,
        }}
      >
        {infoItems.map((item) => (
          <InfoItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            text={item.text}
            colorClass={item.colorClass}
            classes={classes}
            isDark={isDark}
            editMode={editMode}
            infoCombined={infoCombined}
            updatePosition={updatePosition}
            getPosition={getPosition}
          />
        ))}
      </div>
    </Fade>
  );
};

export default PlayerInfo;
