import { React, useEffect, useState, useCallback } from "react";
import { createStyles } from "@mantine/emotion";
import Fade from "../../utils/fade";
import settingsicon from "../../assets/settings.png";
import Option from "./option";
import { NuiEvent } from "../../hooks/NuiEvent";
import { nuicallback } from "../../utils/nuicallback";
import { useTheme } from "../../providers/themeprovider";
import { useHudPosition } from "../../providers/hudpositionprovider";

const PANEL_WIDTH = 920;
const PANEL_HEIGHT = 620;

const styles = createStyles((theme) => ({
  wrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 16,
    zIndex: 5,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 20,
    fontWeight: 600,
    img: {
      width: 24,
      height: 24,
    },
  },
  headerClose: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    fontWeight: 500,
    opacity: 0.7,
  },
  keyBadge: {
    background: "#f93639",
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    gap: 14,
    padding: 16,
    overflowY: "auto",
    minHeight: 0,
  },
  column: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    minHeight: 0,
    paddingRight: 4,
    "&::-webkit-scrollbar": {
      width: 4,
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255,255,255,0.15)",
      borderRadius: 4,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgba(255,255,255,0.25)",
    },
  },
  category: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
  },
  categoryTitle: {
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryOptions: {
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    padding: "8px 18px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: 12,
    textAlign: "right",
    opacity: 0.5,
  },
  tabs: {
    display: "flex",
    gap: 0,
    padding: "0 18px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  tab: {
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s ease",
    opacity: 0.6,
    "&:hover": {
      opacity: 0.8,
    },
  },
  tabActive: {
    opacity: 1,
    borderBottomColor: "#f93639",
  },
  themeGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    padding: 16,
    overflowY: "auto",
    alignContent: "start",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  themeCard: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid transparent",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },
  themeCardSelected: {
    borderColor: "#f93639",
  },
  themePreview: {
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  themeInfo: {
    padding: 10,
  },
  themeName: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  themeAuthor: {
    fontSize: 11,
    opacity: 0.6,
  },
  themeCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#f93639",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "#fff",
  },
  noThemes: {
    gridColumn: "span 2",
    textAlign: "center",
    padding: 40,
    opacity: 0.5,
    fontSize: 14,
  },
}));

const Settings = () => {
  const { classes } = styles();
  const { isDark, setTheme, theme, registeredThemes, currentThemeId, selectExternalTheme, requestThemeList } = useTheme();
  const { enterEditMode, statInfoCombined, setStatInfoCombined, statsCombined, setStatsCombined, infoCombined, setInfoCombined, resetPositions } = useHudPosition();
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("options") // "options" | "theme"
  const [settings, setSettings] = useState({
    show: true,
    showhud: true,
    cinemtic: false,
    circlemap: false,
    showspeedometer: true,
    showplayerstatus: true,
    showplayerinfo: true,
    showminimap: true,
    speedunitmph: true,
    squareminimap: true,
    darkmode: true,
    minimapLeft: true,
    statInfoCombined: true,
    editMode: false,
  });

  const handlesettings = (data) => {
    setSettings(data);
    setVisible(true)
    setActiveTab("options") // Reset to options tab when opened
    // Request theme list
    requestThemeList()
    if (typeof data.darkmode !== 'undefined') {
      setTheme(data.darkmode);
    }
    if (typeof data.statInfoCombined !== 'undefined') {
      setStatInfoCombined(data.statInfoCombined);
    }
    if (typeof data.statsCombined !== 'undefined') {
      setStatsCombined(data.statsCombined);
    }
    if (typeof data.infoCombined !== 'undefined') {
      setInfoCombined(data.infoCombined);
    }
  };

  NuiEvent("settings", handlesettings);

  useEffect(() => {

    const handlekey = (e) => {
      if (visible && e.code == 'Escape') {
        setVisible(false)
        nuicallback("exitsettings")
      }
    };

    window.addEventListener('keydown',handlekey);
    return () => window.removeEventListener('keydown',handlekey);
  })

  return (
    <>
      <Fade in={visible}>
        <div 
          className={`${classes.wrapper} nox-settings`}
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(18, 20, 26, 0.97) 0%, rgba(10, 12, 16, 0.97) 100%)'
              : 'linear-gradient(135deg, rgba(245, 247, 250, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)',
            color: isDark ? '#ffffff' : '#1a1a1a',
          }}
        >
            {/* Header */}
            <div 
              className={classes.header}
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div className={classes.headerTitle}>
                <img src={settingsicon} alt="" style={{ filter: isDark ? 'invert(1)' : 'none' }} />
                <span>SETTINGS</span>
              </div>
              <div className={classes.headerClose}>
                <span className={classes.keyBadge}>ESC</span>
                <span>EXIT</span>
              </div>
            </div>
            
            {/* Tabs */}
            <div 
              className={classes.tabs}
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div 
                className={`${classes.tab} ${activeTab === 'options' ? classes.tabActive : ''}`}
                style={{ color: isDark ? '#fff' : '#1a1a1a' }}
                onClick={() => setActiveTab('options')}
              >
                OPTIONS
              </div>
              <div 
                className={`${classes.tab} ${activeTab === 'theme' ? classes.tabActive : ''}`}
                style={{ color: isDark ? '#fff' : '#1a1a1a' }}
                onClick={() => setActiveTab('theme')}
              >
                THEME
              </div>
            </div>
            
            {/* Body - Options tab */}
            {activeTab === 'options' && (
            <div className={classes.body}>
              {/* Left column */}
              <div className={classes.column}>
                {/* General */}
                <div className={classes.category}>
                  <div 
                    className={classes.categoryTitle}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    General
                  </div>
                  <div className={classes.categoryOptions}>
                    <Option
                      title="Toggle Hud"
                      value={settings.showhud}
                      option1="SHOW"
                      option2="HIDE"
                      option="showhud"
                      compact={true}
                    />
                    <Option
                      title="Cinematic Mode"
                      value={settings.cinemtic}
                      option1="ON"
                      option2="OFF"
                      option="cinemtic"
                      compact={true}
                    />
                    <Option
                      title="Theme"
                      value={isDark}
                      option1="DARK"
                      option2="LIGHT"
                      option="darkmode"
                      onLocalChange={(val) => setTheme(val)}
                      compact={true}
                    />
                  </div>
                </div>
                
                {/* Player Status */}
                <div className={classes.category}>
                  <div 
                    className={classes.categoryTitle}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    Player Status
                  </div>
                  <div className={classes.categoryOptions}>
                    <Option
                      title="Toggle Status"
                      value={settings.showplayerstatus}
                      option1="SHOW"
                      option2="HIDE"
                      option="showplayerstatus"
                      compact={true}
                    />
                  </div>
                </div>
                
                {/* Player Info */}
                <div className={classes.category}>
                  <div 
                    className={classes.categoryTitle}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    Player Info
                  </div>
                  <div className={classes.categoryOptions}>
                    <Option
                      title="Toggle Info"
                      value={settings.showplayerinfo}
                      option1="SHOW"
                      option2="HIDE"
                      option="showplayerinfo"
                      compact={true}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right column */}
              <div className={classes.column}>
                {/* Speedometer */}
                <div className={classes.category}>
                  <div 
                    className={classes.categoryTitle}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    Speedometer
                  </div>
                  <div className={classes.categoryOptions}>
                    <Option
                      title="Toggle"
                      value={settings.showspeedometer}
                      option1="SHOW"
                      option2="HIDE"
                      option="showspeedometer"
                      compact={true}
                    />
                    <Option
                      title="Speed Unit"
                      value={settings.speedunitmph}
                      option1="MPH"
                      option2="KMH"
                      option="speedunitmph"
                      compact={true}
                    />
                  </div>
                </div>
                
                {/* Minimap */}
                <div className={classes.category}>
                  <div 
                    className={classes.categoryTitle}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    Minimap
                  </div>
                  <div className={classes.categoryOptions}>
                    <Option
                      title="Toggle"
                      value={settings.showminimap}
                      option1="SHOW"
                      option2="HIDE"
                      option="showminimap"
                      compact={true}
                    />
                    <Option
                      title="Type"
                      value={settings.circlemap}
                      option1="CIRCLE"
                      option2="SQUARE"
                      option="circlemap"
                      compact={true}
                    />
                    <Option
                      title="Position"
                      value={settings.minimapLeft}
                      option1="LEFT"
                      option2="RIGHT"
                      option="minimapLeft"
                      compact={true}
                    />
                  </div>
                </div>
                
                {/* Customization */}
                <div className={classes.category}>
                  <div 
                    className={classes.categoryTitle}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    Customization
                  </div>
                  <div className={classes.categoryOptions}>
                    <Option
                      title="Stats/Info"
                      value={statInfoCombined}
                      option1="COMBINED"
                      option2="SEPARATE"
                      option="statInfoCombined"
                      onLocalChange={(val) => setStatInfoCombined(val)}
                      compact={true}
                    />
                    <Option
                      title="Stats Group"
                      value={statsCombined}
                      option1="COMBINED"
                      option2="SEPARATE"
                      option="statsCombined"
                      onLocalChange={(val) => setStatsCombined(val)}
                      compact={true}
                      disabled={statInfoCombined}
                    />
                    <Option
                      title="Info Group"
                      value={infoCombined}
                      option1="COMBINED"
                      option2="SEPARATE"
                      option="infoCombined"
                      onLocalChange={(val) => setInfoCombined(val)}
                      compact={true}
                      disabled={statInfoCombined}
                    />
                    <Option
                      title="Edit Mode"
                      isButton={true}
                      buttonText="EDIT LAYOUT"
                      onClick={() => {
                        setVisible(false);
                        nuicallback("exitsettings");
                        setTimeout(() => enterEditMode(), 100);
                      }}
                      compact={true}
                    />
                    <Option
                      title="Reset"
                      isButton={true}
                      buttonText="RESET ALL"
                      onClick={() => {
                        resetPositions();
                      }}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
            )}
            
            {/* Body - Theme tab */}
            {activeTab === 'theme' && (
            <div className={classes.themeGrid}>
              {/* Default theme */}
              <div 
                className={`${classes.themeCard} ${currentThemeId === 'default' ? classes.themeCardSelected : ''}`}
                onClick={() => selectExternalTheme('default')}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <div 
                  className={classes.themePreview}
                  style={{
                    background: 'linear-gradient(135deg, #f93639 0%, #ff6b6b 100%)',
                  }}
                >
                  {currentThemeId === 'default' && (
                    <div className={classes.themeCheckmark}>✓</div>
                  )}
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>DEFAULT</span>
                </div>
                <div 
                  className={classes.themeInfo}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                    color: isDark ? '#fff' : '#1a1a1a',
                  }}
                >
                  <div className={classes.themeName}>Default Theme</div>
                  <div className={classes.themeAuthor}>by NOX</div>
                </div>
              </div>
              
              {/* Registered external themes */}
              {registeredThemes && registeredThemes.filter(t => !t.isDefault).map((themeItem) => (
                <div 
                  key={themeItem.id}
                  className={`${classes.themeCard} ${currentThemeId === themeItem.id ? classes.themeCardSelected : ''}`}
                  onClick={() => selectExternalTheme(themeItem.id)}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <div 
                    className={classes.themePreview}
                    style={{
                      background: themeItem.colors?.primary 
                        ? `linear-gradient(135deg, ${themeItem.colors.primary} 0%, ${themeItem.colors.secondary || themeItem.colors.primary} 100%)`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {currentThemeId === themeItem.id && (
                      <div className={classes.themeCheckmark}>✓</div>
                    )}
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>
                      {themeItem.name?.substring(0, 10) || 'CUSTOM'}
                    </span>
                  </div>
                  <div 
                    className={classes.themeInfo}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                      color: isDark ? '#fff' : '#1a1a1a',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div className={classes.themeName}>{themeItem.name || 'Custom Theme'}</div>
                        <div className={classes.themeAuthor}>by {themeItem.author || 'Unknown'}</div>
                      </div>
                      {currentThemeId === themeItem.id && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisible(false);
                            nuicallback('exitsettings');
                            setTimeout(() => {
                              nuicallback('openThemeSettings', { themeId: themeItem.id });
                            }, 100);
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'; }}
                          title="Theme Settings"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#1a1a1a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Guide when no external theme */}
              {(!registeredThemes || registeredThemes.filter(t => !t.isDefault).length === 0) && (
                <div 
                  className={classes.noThemes}
                  style={{ color: isDark ? '#fff' : '#1a1a1a' }}
                >
                  No external themes registered.<br />
                  <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                    Register a theme using exports['nc-hud']:RegisterTheme().
                  </span>
                </div>
              )}
            </div>
            )}
            
            {/* Footer */}
            <div 
              className={classes.footer}
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              @AfterLife Studios / Rework by NOX (discord.gg/noxcore)
            </div>
        </div>
      </Fade>
    </>
  );
};

export default Settings;
