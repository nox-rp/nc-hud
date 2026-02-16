import { useState, useEffect, useRef } from "react";
import { createStyles, keyframes } from "@mantine/emotion";
import Fade from "../utils/fade";
import { NuiEvent } from "../hooks/NuiEvent";
import { useTheme } from "../providers/themeprovider";
import { useHudPosition } from "../providers/hudpositionprovider";

// Animation definitions
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

// SVG icon definitions
const Icons = {
  fuel: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z"/>
    </svg>
  ),
  engine: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4v2h3v2H7l-2 2v3H3v-3H1v8h2v-3h2v3h3l2 2h8v-4h2v3h3V9h-3v3h-2V8h-6V6h3V4H7z"/>
    </svg>
  ),
  body: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  ),
  seatbelt: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
    </svg>
  ),
  distance: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
    </svg>
  ),
};

// Vertical status bar component (Sector 1 - left vertical)
const VerticalStatusBar = ({ icon, value, color, label, warning, theme }) => {
  const percent = Math.max(0, Math.min(100, value));
  const isLow = percent < 25;
  const displayColor = isLow && warning ? '#e74c3c' : color;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '6px 4px',
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      minWidth: 32,
    }}>
      <div style={{
        width: 18,
        height: 18,
        color: displayColor,
        flexShrink: 0,
        opacity: isLow && warning ? 1 : 0.9,
      }}>
        {icon}
      </div>
      <div style={{
        width: 8,
        height: 60,
        background: theme.statusBg,
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
        <div style={{
          width: '100%',
          height: `${percent}%`,
          background: displayColor,
          borderRadius: 4,
          transition: 'height 0.3s ease, background 0.3s ease',
        }} />
      </div>
      <span style={{
        fontSize: 9,
        fontWeight: 600,
        color: theme.textSecondary,
        textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  );
};

// Vertical info bar (for distance, fuel)
const VerticalInfoBar = ({ icon, value, text, color, label, isPercent, theme }) => {
  const percent = isPercent ? Math.max(0, Math.min(100, value)) : 100;
  const isLow = isPercent && percent < 25;
  const displayColor = isLow ? '#e74c3c' : color;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '6px 4px',
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      minWidth: 36,
    }}>
      <div style={{
        width: 16,
        height: 16,
        color: displayColor,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      {isPercent ? (
        <div style={{
          width: 8,
          height: 50,
          background: theme.statusBg,
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            height: `${percent}%`,
            background: displayColor,
            borderRadius: 4,
            transition: 'height 0.3s ease',
          }} />
        </div>
      ) : (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: displayColor,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>{text}</span>
      )}
      <span style={{
        fontSize: 8,
        fontWeight: 600,
        color: theme.textSecondary,
        textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  );
};

// RPM bar component
const RpmBar = ({ index, active }) => {
  let baseColor = '#00e0ff';
  if (index >= 25) {
    baseColor = '#e74c3c';
  } else if (index >= 22) {
    baseColor = '#f39c12';
  }
  
  const opacity = active ? 0.9 : 0.15;
  
  return (
    <div
      style={{
        width: 6,
        height: 15,
        backgroundColor: baseColor,
        opacity: opacity,
        borderRadius: 2,
        transition: 'opacity 0.05s ease',
      }}
    />
  );
};

// Status icon component (for Sector 2)
const StatusIcon = ({ icon, active, color, blinking, label, theme }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}>
      <i 
        className={`ti ${icon}`}
        style={{
          fontSize: 20,
          color: active ? color : theme?.iconInactive || 'rgba(255, 255, 255, 0.4)',
          filter: active ? `drop-shadow(0 0 4px ${color})` : 'none',
          transition: 'color 0.2s ease, filter 0.2s ease',
          animation: blinking ? 'blink 0.5s infinite' : 'none',
        }}
      />
      {label && (
        <span style={{
          fontSize: 8,
          color: theme?.textSecondary || 'rgba(180, 185, 195, 0.6)',
          textTransform: 'uppercase',
        }}>{label}</span>
      )}
    </div>
  );
};

const useStyles = createStyles(() => ({
  // Full container (2 sectors arranged top-bottom)
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  
  // ========== Sector 1: Main vehicle info ==========
  sector1: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 10,
    background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
  },
  
  // Main row: left(vehicle status) + center(speed) + right(distance/fuel)
  mainRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  // Left: vehicle status bars (horizontal layout)
  statusRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
  },
  
  // Center: speed
  speedSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  speedValue: {
    fontSize: 42,
    fontWeight: 700,
    color: 'rgba(230, 233, 238, 0.95)',
    lineHeight: 1,
    letterSpacing: -1,
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
  },
  
  speedUnit: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(180, 185, 195, 0.7)',
    marginTop: 2,
  },
  
  // Right: distance + fuel (horizontal layout)
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
  },
  
  // Bottom: RPM
  rpmContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    padding: '6px 4px',
    background: 'rgba(10, 12, 16, 0.6)',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  
  // ========== Sector 2: Vehicle status icons (single horizontal row) ==========
  sector2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
    gap: 8,
  },
  
  // Icon cell (1:1 size)
  iconCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    background: 'rgba(18, 20, 24, 0.5)',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
}));

const Speedometer = () => {
  const [vehicle, setVehicle] = useState({
    show: false,
    speed: 0,
    fuel: 100,
    rpm: 0,
    engine: 100,
    body: 100,
    unit: true,
    distance: 0,
    hasWaypoint: false,
    // Sector 2 icon states
    seatbelt: false,
    indicatorLeft: false,
    indicatorRight: false,
    warningLights: false, // Hazard lights
    lights: 0, // 0: off, 1: low beam, 2: high beam
    engineOn: false,
    locked: true,
    handbrake: false,
  });
  
  const [displayRpm, setDisplayRpm] = useState(0);
  const prevRpmRef = useRef(0);
  
  const { theme, isDark } = useTheme();
  const { editMode } = useHudPosition();

  const { classes } = useStyles();

  // Idle bounce effect
  useEffect(() => {
    const interval = setInterval(() => {
      const baseRpm = vehicle.rpm;
      const speed = vehicle.speed;
      
      if (speed <= 5 && baseRpm > 0 && baseRpm < 0.35) {
        const jitter = (Math.random() - 0.5) * 0.08;
        const newRpm = Math.max(0.15, Math.min(0.35, baseRpm + jitter));
        setDisplayRpm(newRpm);
      } else {
        const diff = baseRpm - prevRpmRef.current;
        const smoothRpm = prevRpmRef.current + diff * 0.3;
        setDisplayRpm(smoothRpm);
      }
      
      prevRpmRef.current = displayRpm;
    }, 50);
    
    return () => clearInterval(interval);
  }, [vehicle.rpm, vehicle.speed]);

  const handlespeedometer = (data) => {
    setVehicle((prev) => ({ ...prev, ...data }));
  };

  NuiEvent("speedometer", handlespeedometer);

  // Convert RPM to 0-30 scale
  const rpmBars = 30;
  const activeRpmBars = Math.round(displayRpm * rpmBars);

  // Distance format
  const formatDistance = (meters) => {
    if (vehicle.unit) {
      const miles = meters / 1609.34;
      if (miles < 1) {
        return `${Math.round(miles * 5280)} ft`;
      }
      return `${miles.toFixed(1)} mi`;
    } else {
      const km = meters / 1000;
      if (km < 1) {
        return `${Math.round(meters)} m`;
      }
      return `${km.toFixed(1)} km`;
    }
  };

  return (
    <Fade in={vehicle.show || editMode}>
      <div className={`${classes.wrapper} nox-speedometer`}>
        {/* ========== Sector 1: Main vehicle info ========== */}
        <div className={classes.sector1} style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 242, 245, 0.92) 100%)',
          border: `1px solid ${theme.border}`,
        }}>
          {/* Main row: left(vehicle status) + center(speed) + right(distance/fuel) */}
          <div className={classes.mainRow}>
            {/* Left: vehicle status bars (horizontal) */}
            <div className={classes.statusRow}>
              <VerticalStatusBar 
                icon={Icons.engine} 
                value={vehicle.engine} 
                color="#f39c12" 
                label="ENG"
                warning={true}
                theme={theme}
              />
              <VerticalStatusBar 
                icon={Icons.body} 
                value={vehicle.body} 
                color="#3498db" 
                label="BODY"
                warning={true}
                theme={theme}
              />
            </div>
            
            {/* Center: speed */}
            <div className={classes.speedSection}>
              <span className={classes.speedValue} style={{ color: theme.text }}>{vehicle.speed}</span>
              <span className={classes.speedUnit} style={{ color: theme.textSecondary }}>{vehicle.unit ? "MPH" : "KM/H"}</span>
            </div>
            
            {/* Right: distance + fuel (horizontal, vertical bar form) */}
            <div className={classes.infoRow}>
              {/* Remaining distance (only when waypoint exists) */}
              {vehicle.hasWaypoint && vehicle.distance > 0 && (
                <VerticalInfoBar 
                  icon={Icons.distance}
                  value={0}
                  text={formatDistance(vehicle.distance)}
                  color="#a8e6cf"
                  label="DIST"
                  isPercent={false}
                  theme={theme}
                />
              )}
              
              {/* Fuel */}
              <VerticalInfoBar 
                icon={Icons.fuel}
                value={vehicle.fuel}
                text={`${vehicle.fuel}%`}
                color="#6bcf63"
                label="FUEL"
                isPercent={true}
                theme={theme}
              />
            </div>
          </div>
          
          {/* Bottom: RPM bar */}
          <div className={classes.rpmContainer} style={{
            background: isDark ? 'rgba(10, 12, 16, 0.6)' : 'rgba(220, 225, 230, 0.8)',
            border: `1px solid ${theme.border}`,
          }}>
            {Array.from({ length: rpmBars }).map((_, index) => (
              <RpmBar 
                key={index} 
                index={index} 
                active={index < activeRpmBars}
              />
            ))}
          </div>
        </div>
        
        {/* ========== Sector 2: Vehicle status icons (single horizontal row) ========== */}
        <div className={classes.sector2} style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(10, 12, 16, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 242, 245, 0.92) 100%)',
          border: `1px solid ${theme.border}`,
        }}>
          {/* Left turn signal */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon="ti-arrow-big-left-lines"
              active={vehicle.indicatorLeft || vehicle.warningLights}
              color="#22c55e"
              blinking={vehicle.indicatorLeft || vehicle.warningLights}
              theme={theme}
            />
          </div>
          
          {/* Seatbelt */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon={vehicle.seatbelt ? "ti-armchair" : "ti-armchair-off"}
              active={true}
              color={vehicle.seatbelt ? "#22c55e" : "#ef4444"}
              blinking={!vehicle.seatbelt}
              theme={theme}
            />
          </div>
          
          {/* Lights */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon={vehicle.lights === 2 ? "ti-brightness-up" : vehicle.lights === 1 ? "ti-brightness-down" : "ti-brightness-off"}
              active={true}
              color={vehicle.lights === 2 ? "#60a5fa" : vehicle.lights === 1 ? "#22c55e" : theme.iconInactive}
              theme={theme}
            />
          </div>
          
          {/* Hazard lights (center) */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon="ti-alert-triangle"
              active={true}
              color={vehicle.warningLights ? "#ef4444" : theme.iconInactive}
              blinking={vehicle.warningLights}
              theme={theme}
            />
          </div>
          
          {/* Engine */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon="ti-car"
              active={true}
              color={vehicle.engineOn ? "#22c55e" : "#ef4444"}
              theme={theme}
            />
          </div>
          
          {/* Lock */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon={vehicle.locked ? "ti-lock" : "ti-lock-open"}
              active={true}
              color={vehicle.locked ? "#22c55e" : "#f59e0b"}
              theme={theme}
            />
          </div>
          
          {/* Handbrake */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon="ti-parking"
              active={true}
              color={vehicle.handbrake ? "#ef4444" : theme.iconInactive}
              theme={theme}
            />
          </div>
          
          {/* Right turn signal */}
          <div className={classes.iconCell} style={{ background: isDark ? 'rgba(18, 20, 24, 0.5)' : 'rgba(230, 235, 240, 0.8)', border: `1px solid ${theme.border}` }}>
            <StatusIcon 
              icon="ti-arrow-big-right-lines"
              active={vehicle.indicatorRight || vehicle.warningLights}
              color="#22c55e"
              blinking={vehicle.indicatorRight || vehicle.warningLights}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default Speedometer;
