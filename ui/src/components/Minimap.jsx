import { useState, useRef, useEffect } from "react";
import Fade from "../utils/fade";
import { createStyles } from "@mantine/emotion";
import { NuiEvent } from "../hooks/NuiEvent";
import circlemap from "../assets/circlemap.png";
import { useTheme } from "../providers/themeprovider";

const useStyles = createStyles(() => ({
  circlemap: {
    width: 250,
    transition: "0.1s ease",
  },
  container: {
    position: 'relative',
    pointerEvents: 'none',
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    boxSizing: "border-box",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.65)",
    zIndex: -1,
  },
  holeBorder: {
    position: "absolute",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.45)",
    pointerEvents: "none",
    zIndex: 0,
  },
  contentWrapper: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
  },
  locationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(18, 20, 24, 0.75)",
    boxSizing: "border-box",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
    padding: "0 10px",
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(230, 233, 238, 0.9)",
    letterSpacing: 0.5,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)",
    whiteSpace: "nowrap",
  },
  minimap: {
    position: "relative",
    background: "transparent",
    boxSizing: "border-box",
  },
  compass: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    background: "rgba(12, 14, 18, 0.92)",
    boxSizing: "border-box",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(230, 233, 238, 0.9)",
    letterSpacing: 0.5,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)",
  },
  direction: {
    transition: "all 0.2s ease",
  },
  activeDirection: {
    color: "#00e0ff",
    fontWeight: 700,
    fontSize: 14,
    textShadow: "0 0 8px rgba(0, 224, 255, 0.6)",
  },
  // Circular minimap style
  circleContainer: {
    position: 'fixed',
    pointerEvents: 'none',
  },
  circleFrame: {
    position: 'relative',
    borderRadius: '50%',
    boxSizing: 'border-box',
  },
  circleCompassRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  circleCompassDirection: {
    position: 'absolute',
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(230, 233, 238, 0.85)",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.15s ease',
  },
  circleActiveDirection: {
    color: "#00e0ff",
    fontWeight: 700,
    fontSize: 13,
    textShadow: "0 0 8px rgba(0, 224, 255, 0.7)",
  },
  circleLocationBar: {
    position: 'absolute',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(18, 20, 24, 0.85)",
    boxSizing: "border-box",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    padding: "0 10px",
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(230, 233, 238, 0.9)",
    letterSpacing: 0.5,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)",
    whiteSpace: "nowrap",
  },
}));

const Minimap = () => {
  const [compass, setCompass] = useState({
    show: true,
    circlemap: false,
    width: 203,
    height: 245,
    streetname: "Los Santos",
    postalCode: "",
    heading: 20,
    direction: "NW",
    position: null,
  });

  const { classes } = useStyles();
  const { theme, isDark } = useTheme();
  const containerRef = useRef(null);
  const minimapRef = useRef(null);
  const [minimapTopOffset, setMinimapTopOffset] = useState(null);

  useEffect(() => {
    const updateOffset = () => {
      if (minimapRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const minimapRect = minimapRef.current.getBoundingClientRect();
        setMinimapTopOffset(minimapRect.top - containerRect.top);
      }
    };
    updateOffset();
    const timer = setTimeout(updateOffset, 100);
    const observer = new ResizeObserver(updateOffset);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [compass.show]);

  const handleCompass = (data) => {
    setCompass((prev) => ({
      ...prev,
      ...data,
      streetname: (data.streetname || prev.streetname || "").trim(),
      postalCode: data.postalCode || prev.postalCode || "",
    }));
  };

  NuiEvent("compass", handleCompass);

  const dir = compass.position?.dir || 'L';
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  
  const actualDirection = compass.direction;

  // Padding & size (10px on both sides)
  const framePadding = 10;
  const locationBarHeight = Math.max(24, Math.floor(compass.height * 0.12));
  const compassHeight = Math.max(22, Math.floor(compass.height * 0.11));
  const gap = 6;
  
  // Frame size
  const frameWidth = framePadding + compass.width + framePadding;
  const frameHeight = framePadding + locationBarHeight + gap + compass.height + gap + compassHeight + framePadding;

  // Hole position
  const holeTopOffset = minimapTopOffset !== null ? minimapTopOffset : (framePadding + locationBarHeight + gap);
  const holeHeight = compass.height;
  const holeLeft = framePadding;
  const holeRight = framePadding + compass.width;

  const getFrameStyle = () => {
    if (!compass.position) {
      return { position: 'fixed', left: 0, bottom: 0 };
    }
    
    const pos = compass.position;
    const style = { position: 'fixed' };
    
    if (pos.dir === 'L') {
      style.left = `${pos.left - framePadding}px`;
    } else {
      style.right = `${window.innerWidth - pos.left - compass.width - framePadding}px`;
    }
    
    style.top = `${pos.top - framePadding - locationBarHeight - gap}px`;
    
    return style;
  };

  const generateClipPath = () => {
    const holeTop = holeTopOffset;
    const holeBottom = holeTopOffset + holeHeight;
    
    return `polygon(evenodd, 
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${holeLeft}px ${holeTop}px, 
      ${holeLeft}px ${holeBottom}px, 
      ${holeRight}px ${holeBottom}px, 
      ${holeRight}px ${holeTop}px, 
      ${holeLeft}px ${holeTop}px
    )`;
  };

  const locationText = compass.postalCode 
    ? `[${compass.postalCode}] ${compass.streetname || ''}` 
    : (compass.streetname || '');

  // Calculate compass position for circular minimap (8 directions, placed in border area)
  const getCircleCompassPositions = (diameter, heading) => {
    const radius = diameter / 2;
    const compassRadius = radius * 0.88; // Border area (88% - between ticks and gradient)
    const center = radius;
    
    // Base angles for 8 directions (12 o'clock = 0°, clockwise)
    const baseAngles = {
      "N": 0,
      "NE": 45,
      "E": 90,
      "SE": 135,
      "S": 180,
      "SW": 225,
      "W": 270,
      "NW": 315,
    };
    
    const positions = {};
    directions.forEach(d => {
      const angle = (baseAngles[d] - heading) * (Math.PI / 180);
      positions[d] = {
        x: center + Math.sin(angle) * compassRadius,
        y: center - Math.cos(angle) * compassRadius,
      };
    });
    
    return positions;
  };

  // Calculate tick positions (36 = 10° intervals)
  const getTickPositions = (diameter, heading) => {
    const radius = diameter / 2;
    const tickRadius = radius * 0.95; // Tick position (outer)
    const center = radius;
    const ticks = [];
    
    for (let i = 0; i < 36; i++) {
      const baseDeg = i * 10;
      const angle = (baseDeg - heading) * (Math.PI / 180);
      const isMajor = baseDeg % 45 === 0; // Major ticks at 45° intervals
      
      ticks.push({
        x: center + Math.sin(angle) * tickRadius,
        y: center - Math.cos(angle) * tickRadius,
        isMajor,
        angle: baseDeg - heading,
      });
    }
    
    return ticks;
  };

  // Calculate circular minimap style
  const getCircleFrameStyle = () => {
    // Use exact position/size if circleData exists
    if (compass.circleData) {
      const cd = compass.circleData;
      return { 
        position: 'fixed',
        left: `${cd.left}px`,
        top: `${cd.top}px`,
        width: cd.diameter,
        height: cd.diameter,
      };
    }
    
    if (!compass.position) {
      return { 
        position: 'fixed', 
        left: 0, 
        bottom: 0,
        width: compass.width,
        height: compass.width,
      };
    }
    
    const pos = compass.position;
    const diameter = compass.width;
    
    return { 
      position: 'fixed',
      left: `${pos.left}px`,
      top: `${pos.top}px`,
      width: diameter,
      height: diameter,
    };
  };

  // Circular minimap diameter (use circleData if available)
  const circleDiameter = compass.circleData?.diameter || compass.width;

  return (
    <>
      <Fade in={compass.show}>
        {compass.circlemap ? (
          // === Circular minimap UI ===
          <div 
            className={`${classes.circleContainer} nox-minimap nox-minimap-circle`}
            style={getCircleFrameStyle()}
          >
            {/* Location bar (placed above minimap) */}
            <div
              className={classes.circleLocationBar}
              style={{
                left: '50%',
                top: -30,
                transform: 'translateX(-50%)',
                height: 24,
                minWidth: circleDiameter * 0.85,
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 242, 245, 0.92) 100%)',
                color: theme.text,
                border: `1px solid ${theme.border}`,
                boxShadow: isDark 
                  ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                  : '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {locationText}
            </div>

            {/* Circular frame background - gradient fading to transparent inward */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              viewBox={`0 0 ${circleDiameter} ${circleDiameter}`}
            >
              <defs>
                {/* Gradient only on outer ticks - fully transparent inside */}
                <radialGradient id="fadeGradientDark" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(18, 20, 26, 0)" />
                  <stop offset="78%" stopColor="rgba(18, 20, 26, 0)" />
                  <stop offset="85%" stopColor="rgba(18, 20, 26, 0.5)" />
                  <stop offset="92%" stopColor="rgba(14, 16, 20, 0.85)" />
                  <stop offset="100%" stopColor="rgba(10, 12, 16, 0.95)" />
                </radialGradient>
                <radialGradient id="fadeGradientLight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                  <stop offset="78%" stopColor="rgba(255, 255, 255, 0)" />
                  <stop offset="85%" stopColor="rgba(245, 247, 250, 0.5)" />
                  <stop offset="92%" stopColor="rgba(240, 242, 245, 0.85)" />
                  <stop offset="100%" stopColor="rgba(235, 237, 240, 0.95)" />
                </radialGradient>
              </defs>
              {/* Background - transparent inward */}
              <circle 
                cx={circleDiameter/2} 
                cy={circleDiameter/2} 
                r={circleDiameter/2 - 1} 
                fill={isDark ? 'url(#fadeGradientDark)' : 'url(#fadeGradientLight)'}
              />
              {/* Outer border */}
              <circle 
                cx={circleDiameter/2} 
                cy={circleDiameter/2} 
                r={circleDiameter/2 - 1} 
                fill="none"
                stroke={theme.border}
                strokeWidth="1"
              />
              {/* Ticks - placed in border area (based on radius) */}
              {getTickPositions(circleDiameter, compass.heading).map((tick, i) => {
                const r = circleDiameter / 2;  // Radius
                const innerR = r * (tick.isMajor ? 0.82 : 0.85);
                const outerR = r * 0.95;
                const angleRad = tick.angle * (Math.PI / 180);
                const x1 = circleDiameter/2 + Math.sin(angleRad) * innerR;
                const y1 = circleDiameter/2 - Math.cos(angleRad) * innerR;
                const x2 = circleDiameter/2 + Math.sin(angleRad) * outerR;
                const y2 = circleDiameter/2 - Math.cos(angleRad) * outerR;
                
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={tick.isMajor ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')}
                    strokeWidth={tick.isMajor ? 2 : 1}
                  />
                );
              })}
            </svg>

            {/* Compass direction text */}
            <div className={classes.circleCompassRing}>
              {directions.map((d) => {
                const positions = getCircleCompassPositions(circleDiameter, compass.heading);
                const pos = positions[d];
                const isActive = actualDirection === d;
                
                return (
                  <span
                    key={d}
                    className={`${classes.circleCompassDirection} ${isActive ? classes.circleActiveDirection : ''}`}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      color: isActive ? '#00e0ff' : (isDark ? 'rgba(230, 233, 238, 0.9)' : 'rgba(30, 35, 40, 0.9)'),
                    }}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className={`${classes.container} nox-minimap nox-minimap-square`} 
            style={{
              ...getFrameStyle(),
              width: frameWidth,
              height: frameHeight,
            }}
          >
            {/* Background layer */}
            <div 
              className={classes.backgroundLayer}
              style={{ 
                clipPath: generateClipPath(),
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 242, 245, 0.92) 100%)',
                border: `1px solid ${theme.border}`,
              }}
            />

            {/* Transparent hole border */}
            <div 
              className={classes.holeBorder}
              style={{
                left: holeLeft,
                top: holeTopOffset,
                width: compass.width,
                height: holeHeight,
                border: `1px solid ${theme.border}`,
              }}
            />

            {/* Content wrapper */}
            <div 
              className={classes.contentWrapper}
              style={{ padding: framePadding, gap }}
            >
              {/* Location bar */}
              <div 
                className={classes.locationBar}
                style={{ 
                  height: locationBarHeight, 
                  width: compass.width,
                  background: isDark ? 'rgba(18, 20, 24, 0.75)' : 'rgba(230, 235, 240, 0.85)',
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {locationText}
              </div>

              {/* Minimap area */}
              <div 
                ref={minimapRef}
                className={classes.minimap} 
                style={{ width: compass.width, height: compass.height }}
              />

              {/* Compass */}
              <div
                className={classes.compass}
                style={{ 
                  width: compass.width, 
                  height: compassHeight, 
                  padding: '3px 0',
                  background: isDark ? 'rgba(12, 14, 18, 0.92)' : 'rgba(230, 235, 240, 0.92)',
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {directions.map((d) => (
                  <span
                    key={d}
                    className={`${classes.direction} ${
                      actualDirection === d ? classes.activeDirection : ""
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Fade>
    </>
  );
};

export default Minimap;
