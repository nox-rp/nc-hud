import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { nuicallback } from "../utils/nuicallback";

const BUILTIN_DEFAULT_POSITIONS = {
  playerStats: null,
  playerInfo: null,
  speedometer: null,
  combined: null,
  // SEPARATE mode individual items
  stats_health: null,
  stats_armor: null,
  stats_hunger: null,
  stats_thirst: null,
  stats_oxygen: null,
  stats_stress: null,
  info_server: null,
  info_time: null,
  info_job: null,
  info_cash: null,
  info_bank: null,
};

const HudPositionCtx = createContext(null);

const getScreenBounds = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const isOutOfBounds = (pos) => {
  const { width, height } = getScreenBounds();
  return Math.abs(pos.x) > width || Math.abs(pos.y) > height;
};

// Save position to server
const savePositions = (positions) => {
  nuicallback("savePosition", positions).catch(() => {});
};

const HudPositionProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [statInfoCombined, setStatInfoCombined] = useState(true);
  const [statsCombined, setStatsCombined] = useState(true);
  const [infoCombined, setInfoCombined] = useState(true);
  const [positions, setPositions] = useState(BUILTIN_DEFAULT_POSITIONS);
  const [minimapDir, setMinimapDir] = useState('L'); // 'L' or 'R'
  const editModeRef = useRef(false);

  // Sync editMode ref
  useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode]);

  // Message listener - register only once on mount
  useEffect(() => {
    const handleMessage = (event) => {
      const { action, data } = event.data;
      
      if (action === "settings") {
        // Individual option change (from callback)
        if (data?.option === "editMode") {
          setEditMode(Boolean(data.input));
        }
        if (data?.option === "statInfoCombined") {
          setStatInfoCombined(Boolean(data.input));
        }
        if (data?.option === "statsCombined") {
          setStatsCombined(Boolean(data.input));
        }
        if (data?.option === "infoCombined") {
          setInfoCombined(Boolean(data.input));
        }
        
        // When it's a full settings object (when pressing keybind 'i')
        if (data && !data.option) {
          if (typeof data.statInfoCombined !== 'undefined') {
            setStatInfoCombined(Boolean(data.statInfoCombined));
          }
          if (typeof data.statsCombined !== 'undefined') {
            setStatsCombined(Boolean(data.statsCombined));
          }
          if (typeof data.infoCombined !== 'undefined') {
            setInfoCombined(Boolean(data.infoCombined));
          }
        }
      } else if (action === "setEditMode") {
        setEditMode(Boolean(data));
      } else if (action === "resetHudPositions" || action === "positionsReset") {
        setPositions(BUILTIN_DEFAULT_POSITIONS);
      } else if (action === "loadPositions") {
        if (data && typeof data === "object") {
          setPositions(prev => {
            const newPositions = { ...prev };
            for (const key of Object.keys(BUILTIN_DEFAULT_POSITIONS)) {
              if (data[key + 'X'] !== undefined && data[key + 'Y'] !== undefined) {
                newPositions[key] = { x: data[key + 'X'], y: data[key + 'Y'] };
              }
            }
            return newPositions;
          });
        }
      } else if (action === "loadSettings") {
        // Apply options when settings are loaded
        if (data && typeof data === "object") {
          if (typeof data.statInfoCombined !== 'undefined') {
            setStatInfoCombined(Boolean(data.statInfoCombined));
          }
          if (typeof data.statsCombined !== 'undefined') {
            setStatsCombined(Boolean(data.statsCombined));
          }
          if (typeof data.infoCombined !== 'undefined') {
            setInfoCombined(Boolean(data.infoCombined));
          }
        }
      } else if (action === "compass") {
        // Update minimap position
        if (data && data.position && data.position.dir) {
          setMinimapDir(data.position.dir);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && editModeRef.current) {
        setEditMode(false);
        nuicallback("closeEditMode");
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeyDown);
    
    // Notify UI ready - so Lua sends settings
    nuicallback("uiReady", {}).catch(() => {});
    
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);  // Empty dependency - only once on mount

  const clampPosition = useCallback((pos) => {
    const { width, height } = getScreenBounds();
    return {
      x: Math.max(-width, Math.min(width, pos.x)),
      y: Math.max(-height, Math.min(height, pos.y)),
    };
  }, []);

  const updatePosition = useCallback((key, delta) => {
    setPositions((prev) => {
      const current = prev[key] || { x: 0, y: 0 };
      const newPos = clampPosition({
        x: current.x + delta.x,
        y: current.y + delta.y,
      });
      const newPositions = {
        ...prev,
        [key]: newPos,
      };
      savePositions(newPositions);
      return newPositions;
    });
  }, [clampPosition]);

  const getPosition = useCallback(
    (key) => positions[key] || null,
    [positions]
  );

  const exitEditMode = useCallback(() => {
    setEditMode(false);
    nuicallback("closeEditMode");
  }, []);

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    nuicallback("enterEditMode");
  }, []);

  const resetPositions = useCallback(() => {
    setPositions(BUILTIN_DEFAULT_POSITIONS);
    nuicallback("resetPositions");
  }, []);

  return (
    <HudPositionCtx.Provider
      value={{ 
        editMode, 
        setEditMode, 
        statInfoCombined,
        setStatInfoCombined,
        statsCombined,
        setStatsCombined,
        infoCombined,
        setInfoCombined,
        minimapDir,
        positions, 
        updatePosition, 
        getPosition,
        exitEditMode,
        enterEditMode,
        resetPositions
      }}
    >
      {children}
    </HudPositionCtx.Provider>
  );
};

export default HudPositionProvider;

export const useHudPosition = () => {
  const ctx = useContext(HudPositionCtx);
  if (!ctx) {
    // Return defaults when used outside Provider
    return {
      editMode: false,
      setEditMode: () => {},
      statInfoCombined: true,
      setStatInfoCombined: () => {},
      statsCombined: true,
      setStatsCombined: () => {},
      infoCombined: true,
      setInfoCombined: () => {},
      minimapDir: 'L',
      positions: BUILTIN_DEFAULT_POSITIONS,
      updatePosition: () => {},
      getPosition: () => null,
      exitEditMode: () => {},
      enterEditMode: () => {},
      resetPositions: () => {},
    };
  }
  return ctx;
};
