import React, { useEffect, useRef, useState, useCallback } from "react";
import { createStyles, keyframes } from "@mantine/emotion";
import Fade from "../utils/fade";
import { NuiEvent } from "../hooks/NuiEvent";
import { useTheme } from "../providers/themeprovider";
import { useHudPosition } from "../providers/hudpositionprovider";

const bulletPulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.6 },
});

const useStyles = createStyles((theme) => ({
  weaponContainer: {
    position: 'fixed',
    top: '50%',
    right: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
  },
  
  ammoNumbers: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
  },
  
  currentAmmo: {
    fontFamily: "'Noto Sans KR', Inter, sans-serif",
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadow: "0 2px 4px rgba(0,0,0,0.8)",
    lineHeight: 1,
  },
  
  maxAmmo: {
    fontFamily: "'Noto Sans KR', Inter, sans-serif",
    fontSize: 16,
    fontWeight: "400",
    color: "#888888",
    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
    lineHeight: 1,
  },
  
  bulletContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2px",
    width: "100%",
    justifyContent: "flex-end",
    maxWidth: "280px",
  },
  
  bullet: {
    width: "4px",
    height: "16px",
    backgroundColor: "#FFFFFF",
    transition: "all 0.2s ease",
    borderRadius: 1,
  },
  
  bulletEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  
  bulletLow: {
    backgroundColor: "#FF6B6B",
    boxShadow: "0 0 4px rgba(255, 107, 107, 0.5)",
  },
  
  bulletCritical: {
    backgroundColor: "#FF3333",
    boxShadow: "0 0 5px rgba(255, 51, 51, 0.7)",
    animation: `${bulletPulse} 1s infinite`,
  },
  
  weaponName: {
    fontFamily: "'Noto Sans KR', Inter, sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
    textAlign: "right",
    marginTop: 2,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
}));

const WeaponHUD = () => {
  const { classes } = useStyles();
  const { isDark } = useTheme();
  const { getPosition, updatePosition, editMode } = useHudPosition();
  const weaponPosition = getPosition("weapon");
  const startPos = useRef({ x: 0, y: 0 });
  const [weapon, setWeapon] = useState({
    show: false,
    ammo: 0,
    maxAmmo: 0,
    name: null,
    aiming: false,
  });
  const [displayAmmo, setDisplayAmmo] = useState(0);
  const displayAmmoRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastAmmoRef = useRef(0);
  const lastWeaponKeyRef = useRef("");

  useEffect(() => {
    displayAmmoRef.current = displayAmmo;
  }, [displayAmmo]);

  const handleWeapon = (data) => {
    setWeapon(prev => ({
      ...prev,
      show: data.show !== undefined ? data.show : prev.show,
      ammo: data.ammo !== undefined ? data.ammo : prev.ammo,
      maxAmmo: data.maxAmmo !== undefined ? data.maxAmmo : prev.maxAmmo,
      name: data.name !== undefined ? data.name : prev.name,
      aiming: data.aiming !== undefined ? data.aiming : prev.aiming,
    }));
  };

  NuiEvent("weapon", handleWeapon);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!weapon.show) {
      lastAmmoRef.current = weapon.ammo;
      setDisplayAmmo(weapon.ammo);
      return;
    }

    const weaponKey = `${weapon.name || ""}|${weapon.maxAmmo}`;
    if (weaponKey !== lastWeaponKeyRef.current) {
      lastWeaponKeyRef.current = weaponKey;
      lastAmmoRef.current = weapon.ammo;
      setDisplayAmmo(weapon.ammo);
      return;
    }

    const previousAmmo = lastAmmoRef.current;
    if (weapon.ammo <= previousAmmo) {
      lastAmmoRef.current = weapon.ammo;
      setDisplayAmmo(weapon.ammo);
      return;
    }

    const startValue = Math.min(displayAmmoRef.current, previousAmmo);
    const targetValue = weapon.ammo;
    const durationMs = 350;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const nextValue = startValue + (targetValue - startValue) * progress;
      setDisplayAmmo(nextValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        lastAmmoRef.current = weapon.ammo;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [weapon.ammo, weapon.maxAmmo, weapon.name, weapon.show]);

  // Drag handler - declared before early return since it's a hook
  const handleMouseDown = useCallback((e) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    startPos.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      updatePosition("weapon", { x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [editMode, updatePosition]);

  // Don't display if not in editMode and weapon.show is false
  if (!weapon.show && !editMode) {
    return null;
  }

  const MAX_VISUAL_BULLETS = 50;
  const isLargeCapacity = weapon.maxAmmo > MAX_VISUAL_BULLETS;

  const clampedDisplayAmmo = Math.max(0, Math.min(displayAmmo, weapon.maxAmmo));
  const ammoPercentage = weapon.maxAmmo > 0 ? (clampedDisplayAmmo / weapon.maxAmmo) * 100 : 0;
  const displayBullets = isLargeCapacity ? MAX_VISUAL_BULLETS : weapon.maxAmmo;
  const rawBulletsToShow = isLargeCapacity 
    ? Math.ceil((clampedDisplayAmmo / weapon.maxAmmo) * displayBullets)
    : Math.floor(clampedDisplayAmmo);
  const bulletsToShow = Math.min(displayBullets, Math.max(0, rawBulletsToShow));
  
  const getBulletClass = (index) => {
    if (index >= bulletsToShow) {
      return `${classes.bullet} ${classes.bulletEmpty}`;
    }
    
    if (ammoPercentage <= 10) {
      return `${classes.bullet} ${classes.bulletCritical}`;
    } else if (ammoPercentage <= 25) {
      return `${classes.bullet} ${classes.bulletLow}`;
    }
    
    return classes.bullet;
  };

  // Position: 20px bottom-right of crosshair (default) + custom offset
  const offsetX = weaponPosition?.x || 0;
  const offsetY = weaponPosition?.y || 0;

  return (
    <Fade in={weapon.show || editMode}>
      <div 
        className={`${classes.weaponContainer} nox-weapon-hud`}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translateY(-50%) translate(${offsetX}px, ${offsetY}px)`,
          cursor: editMode ? 'move' : 'default',
          outline: editMode ? '2px dashed rgba(255, 255, 255, 0.5)' : 'none',
          outlineOffset: editMode ? '2px' : '0',
        }}
      >
        <div className={classes.ammoNumbers}>
          <span className={classes.currentAmmo} style={{ color: isDark ? '#FFFFFF' : '#1a1a1a' }}>
            {Math.floor(weapon.ammo)}
          </span>
          <span className={classes.maxAmmo} style={{ color: isDark ? '#888888' : '#666666' }}>
            / {weapon.maxAmmo}
          </span>
        </div>
        
        <div className={classes.bulletContainer}>
          {Array.from({ length: displayBullets }, (_, index) => (
            <div
              key={index}
              className={getBulletClass(index)}
            />
          ))}
        </div>
        
        {weapon.name && (
          <div className={classes.weaponName} style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
            {weapon.name}
          </div>
        )}
      </div>
    </Fade>
  );
};

export default WeaponHUD;
