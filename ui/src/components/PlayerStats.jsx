import { useState, useRef, useCallback } from "react";
import { createStyles } from "@mantine/emotion";
import { NuiEvent } from "../hooks/NuiEvent";
import Fade from "../utils/fade";
import { useTheme } from "../providers/themeprovider";
import { useHudPosition } from "../providers/hudpositionprovider";

// SVG icon definitions
const Icons = {
  health: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  armor: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  ),
  hunger: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05l-5 2V1h-2v8l-5-2-1.66 16.47c-.09.82.6 1.52 1.42 1.52h1.66l.58-6h4.47l.59 6zm-.41-8H13l.58-6h3.59l.48 6zM1 21.99h6V6l-6 6v9.99z"/>
    </svg>
  ),
  thirst: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
    </svg>
  ),
  oxygen: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3v-3h-3V2l-1.5 1.5zM15 19H6c-.55 0-1-.45-1-1v-1h10v2zm6-1c0 .55-.45 1-1 1s-1-.45-1-1v-1h2v1zm-2-3H8v-2h11v2zm0-4H8V9h11v2zm0-4H8V5h11v2z"/>
    </svg>
  ),
  stress: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm1-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
    </svg>
  ),
};

// Stat icon component (drag individually based on statsCombined)
const StatIcon = ({ id, icon, value, color, size = 36, theme, isDark, editMode, statsCombined, updatePosition, getPosition }) => {
  const startPos = useRef({ x: 0, y: 0 });
  const position = getPosition(id) || { x: 0, y: 0 };
  const fillPercent = Math.max(0, Math.min(100, value));
  const iconSize = Math.floor(size * 0.56);

  // Only allow individual drag when statsCombined is false
  const handleMouseDown = useCallback((e) => {
    if (!editMode || statsCombined) return;
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
  }, [editMode, statsCombined, updatePosition, id]);

  // Apply individual position if statsCombined is false
  const itemStyle = !statsCombined ? {
    transform: `translate(${position.x}px, ${position.y}px)`,
    cursor: editMode ? 'move' : 'default',
    outline: editMode ? `2px dashed ${isDark ? 'rgba(249, 54, 57, 0.7)' : 'rgba(249, 54, 57, 0.8)'}` : 'none',
    outlineOffset: editMode ? '2px' : 0,
    zIndex: editMode ? 1000 : 100,
  } : {};

  return (
    <div 
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...itemStyle,
      }}
    >
      {/* Background rectangle */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: theme?.cardBg || 'rgba(18, 20, 26, 0.85)',
        borderRadius: 6,
        border: `1px solid ${theme?.border || 'rgba(255, 255, 255, 0.08)'}`,
      }} />
      
      {/* Icon background (empty state) */}
      <div style={{
        position: 'relative',
        width: iconSize,
        height: iconSize,
        color: theme?.iconInactive || 'rgba(80, 85, 95, 0.6)',
        zIndex: 1,
      }}>
        {icon}
      </div>
      
      {/* Icon filled portion */}
      <div style={{
        position: 'absolute',
        width: iconSize,
        height: iconSize,
        color: color,
        zIndex: 2,
        clipPath: `inset(${100 - fillPercent}% 0 0 0)`,
        transition: 'clip-path 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
    </div>
  );
};

const useStyles = createStyles(() => ({
  container: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
  },
}));

// combined: statInfoCombined (bundle STATS/INFO) - passed from Hud.jsx
const PlayerStats = ({ combined = false }) => {
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
  const { classes } = useStyles();
  const { theme, isDark } = useTheme();
  const { editMode, statsCombined, updatePosition, getPosition } = useHudPosition();
  
  const containerPosition = getPosition("playerStats") || { x: 0, y: 0 };

  const handleStatus = (data) => {
    setStatus((prev) => ({
      ...prev,
      show: data.show !== undefined ? data.show : prev.show,
      health: data.health !== undefined ? Math.min(data.health, 100) : prev.health,
      armour: data.armour !== undefined ? data.armour : prev.armour,
      hunger: data.hunger !== undefined ? data.hunger : prev.hunger,
      thirst: data.thirst !== undefined ? data.thirst : prev.thirst,
      oxygen: data.oxygen !== undefined ? data.oxygen : prev.oxygen,
      stress: data.stress !== undefined ? data.stress : prev.stress,
    }));
  };

  NuiEvent("playerstatus", handleStatus);

  // Drag entire container when statsCombined is true
  const handleContainerMouseDown = useCallback((e) => {
    if (!editMode || !statsCombined || combined) return;  // If combined(statInfoCombined) is true, handled in Hud.jsx
    e.preventDefault();
    e.stopPropagation();
    startPos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      updatePosition("playerStats", { x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [editMode, statsCombined, combined, updatePosition]);

  // Stat item definitions
  const statItems = [
    { id: 'stats_health', icon: Icons.health, value: status.health, color: '#e74c3c' },
    { id: 'stats_armor', icon: Icons.armor, value: status.armour, color: '#3498db' },
    { id: 'stats_hunger', icon: Icons.hunger, value: status.hunger, color: '#f39c12' },
    { id: 'stats_thirst', icon: Icons.thirst, value: status.thirst, color: '#00bcd4' },
    { id: 'stats_oxygen', icon: Icons.oxygen, value: status.oxygen, color: '#9b59b6' },
    { id: 'stats_stress', icon: Icons.stress, value: status.stress, color: '#e91e63' },
  ];

  // If combined is true, background/drag handled in Hud.jsx wrapper
  // If combined is false, use own container
  if (combined) {
    // If statInfoCombined is true: return items only without background
    return (
      <Fade in={status.show}>
        <div style={{ display: 'flex', gap: 6 }}>
          {statItems.map((item) => (
            <StatIcon
              key={item.id}
              id={item.id}
              icon={item.icon}
              value={item.value}
              color={item.color}
              size={36}
              theme={theme}
              isDark={isDark}
              editMode={editMode}
              statsCombined={statsCombined}
              updatePosition={updatePosition}
              getPosition={getPosition}
            />
          ))}
        </div>
      </Fade>
    );
  }

  // If statInfoCombined is false: use own container (bottom center)
  const baseTransform = 'translateX(-50%)';
  const offsetTransform = (containerPosition.x !== 0 || containerPosition.y !== 0) 
    ? `${baseTransform} translate(${containerPosition.x}px, ${containerPosition.y}px)` 
    : baseTransform;

  return (
    <Fade in={status.show}>
      <div 
        className={`${classes.container} nox-player-stats`}
        onMouseDown={handleContainerMouseDown}
        style={{
          left: '50%',
          bottom: 10,
          transform: offsetTransform,
          cursor: (editMode && statsCombined) ? 'move' : 'default',
          outline: (editMode && statsCombined) ? `2px dashed ${isDark ? 'rgba(249, 54, 57, 0.7)' : 'rgba(249, 54, 57, 0.8)'}` : 'none',
          outlineOffset: (editMode && statsCombined) ? '2px' : 0,
          zIndex: editMode ? 1000 : undefined,
          // Transparent container background if statsCombined is false
          background: statsCombined 
            ? (isDark 
              ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 242, 245, 0.92) 100%)')
            : 'transparent',
          border: statsCombined ? `1px solid ${theme.border}` : 'none',
          boxShadow: statsCombined ? '0 8px 24px rgba(0, 0, 0, 0.65)' : 'none',
          padding: statsCombined ? 8 : 0,
        }}
      >
        {statItems.map((item) => (
          <StatIcon
            key={item.id}
            id={item.id}
            icon={item.icon}
            value={item.value}
            color={item.color}
            size={36}
            theme={theme}
            isDark={isDark}
            editMode={editMode}
            statsCombined={statsCombined}
            updatePosition={updatePosition}
            getPosition={getPosition}
          />
        ))}
      </div>
    </Fade>
  );
};

export default PlayerStats;
