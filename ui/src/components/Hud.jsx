import { React, useState, useEffect, useRef, useCallback } from "react";
import Fade from "../utils/fade";
import { createStyles } from "@mantine/emotion";
import Minimap from "./Minimap";
import Speedometer from "./Speedometer";
import PlayerStats from "./PlayerStats";
import PlayerInfo from "./PlayerInfo";
import WeaponHUD from "./WeaponHUD";
import Crosshair from "./Crosshair";
import Settings from "./settings/settings";
import { NuiEvent } from "../hooks/NuiEvent";
import { useTheme } from "../providers/themeprovider";
import { useHudPosition } from "../providers/hudpositionprovider";

const useStyles = createStyles((theme) => ({
  vehicle: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'end',
    gap: 5,
  },
  infoWrapper: {
    position: 'fixed',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
  },
  statsWrapper: {
    position: 'fixed',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 6,
  },
  editModeOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 900,
    pointerEvents: 'none',
  },
  editModeHint: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    pointerEvents: 'auto',
  },
  exitButton: {
    padding: '6px 12px',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
  },
}));
               
const Hud = () => {
  const [visible, setVisible] = useState(true);
  const [cinematic, setCinematic] = useState(false);
  const [isDraggingVehicle, setIsDraggingVehicle] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const { classes } = useStyles();
  const { isDark, theme, isComponentHidden } = useTheme();
  const { editMode, exitEditMode, updatePosition, getPosition } = useHudPosition();
  
  const vehiclePosition = getPosition("speedometer") || { x: 0, y: 0 };

  const handlevisible = (data) => {
    setVisible(data);
  }
  NuiEvent("visible", handlevisible);
  
  NuiEvent("cinematic", (data) => {
    setCinematic(data);
  });

  // Vehicle drag handler
  const handleVehicleMouseDown = useCallback((e) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVehicle(true);
    startPos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      updatePosition("speedometer", { x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDraggingVehicle(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [editMode, updatePosition]);

  // Calculate vehicle offset transform
  const vehicleTransform = (vehiclePosition.x !== 0 || vehiclePosition.y !== 0) 
    ? `translate(${vehiclePosition.x}px, ${vehiclePosition.y}px)` 
    : undefined;

  return (
    <>
      <Settings/>
      {!isComponentHidden('crosshair') && <Crosshair />}
      
      {/* Edit mode overlay */}
      {editMode && (
        <>
          <div className={classes.editModeOverlay} />
          <div 
            className={classes.editModeHint}
            style={{
              background: isDark ? 'rgba(18, 20, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              color: isDark ? '#ffffff' : '#1a1a1a',
              border: `2px solid ${isDark ? 'rgba(249, 54, 57, 0.8)' : '#f93639'}`,
            }}
          >
            <span>EDIT MODE - Drag components to reposition</span>
            <button 
              className={classes.exitButton}
              onClick={exitEditMode}
              style={{
                background: '#f93639',
                color: '#ffffff',
              }}
            >
              ESC TO EXIT
            </button>
          </div>
        </>
      )}
      
      <Fade in={visible}>
        {/* PlayerInfo - top center */}
        {!isComponentHidden('playerInfo') && !cinematic && <PlayerInfo />}
        
        {/* Minimap - manages its own position */}
        {!isComponentHidden('minimap') && !isComponentHidden('compass') && !cinematic && <Minimap />}
        
        {/* PlayerStats - vertical boxes next to minimap */}
        {!isComponentHidden('playerStats') && !cinematic && <PlayerStats />}
        
        {/* Speedometer - draggable in edit mode */}
        {!isComponentHidden('speedometer') && !cinematic && (
        <div 
          className={`${classes.vehicle} nox-speedometer-container`}
          onMouseDown={handleVehicleMouseDown}
          style={{
            transform: vehicleTransform,
            cursor: editMode ? 'move' : 'default',
            outline: editMode ? `2px dashed ${isDark ? 'rgba(249, 54, 57, 0.7)' : 'rgba(249, 54, 57, 0.8)'}` : 'none',
            outlineOffset: editMode ? '2px' : 0,
            zIndex: editMode ? 1000 : undefined,
          }}
        >
          <Speedometer />
        </div>
        )}
        
        {/* Weapon HUD - bottom left */}
        {!isComponentHidden('weaponHud') && !cinematic && <WeaponHUD />}
      </Fade>
    </>
  );
};

export default Hud;
