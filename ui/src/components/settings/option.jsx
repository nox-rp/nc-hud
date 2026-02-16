import { React, useState, useEffect } from "react";
import { createStyles } from "@mantine/emotion";
import { nuicallback } from "../../utils/nuicallback";
import { useTheme } from "../../providers/themeprovider";

const styles = createStyles((theme) => ({
  option: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background 0.15s ease",
  },
  input: {
    display: "flex",
    flexDirection: "row",
    cursor: "pointer",
  },
  inputOption: {
    transition: "opacity 0.15s ease",
    "&:hover": {
      opacity: "0.8 !important",
    },
  },
  button: {
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: "none",
    fontFamily: "'Noto Sans KR', sans-serif",
    fontWeight: 600,
    textTransform: "uppercase",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
}));

const Option = (data) => {
  const { classes } = styles();
  const { isDark, theme } = useTheme();
  const compact = data.compact;
  
  const [input, setinput] = useState(data.value);

  // Sync local state when props.value changes
  useEffect(() => {
    setinput(data.value);
  }, [data.value]);

  const handleinput = (input, option) => {
    setinput(input);
    nuicallback("settings", { option, input });
    if (data.onLocalChange) {
      data.onLocalChange(input);
    }
  };

  // Button mode
  if (data.isButton) {
    return (
      <div 
        className={classes.option} 
        style={{
          height: compact ? 32 : 38,
          padding: compact ? '0 12px' : '0 14px',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ 
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: compact ? 14 : 16,
          fontWeight: 500,
          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
          textTransform: 'uppercase',
        }}>
          {data.title}
        </span>
        <button
          className={classes.button}
          onClick={data.onClick}
          style={{
            fontSize: compact ? 11 : 12,
            background: data.title === 'Reset' 
              ? (isDark ? 'rgba(249, 54, 57, 0.8)' : '#f93639')
              : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
            color: data.title === 'Reset'
              ? '#ffffff'
              : (isDark ? '#ffffff' : '#1a1a1a'),
          }}
        >
          {data.buttonText}
        </button>
      </div>
    );
  }

  const disabled = data.disabled || false;

  return (
    <div 
      className={classes.option} 
      style={{
        height: compact ? 32 : 38,
        padding: compact ? '0 12px' : '0 14px',
        background: isDark ? 'transparent' : 'transparent',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ 
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: compact ? 14 : 16,
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
        textTransform: 'uppercase',
      }}>
        {data.title}
      </span>
      <div className={classes.input} style={{ gap: compact ? 12 : 16 }}>
        <span
          className={classes.inputOption}
          onClick={() => !disabled && handleinput(true, data.option)}
          style={{ 
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: compact ? 12 : 14,
            fontWeight: 600,
            opacity: input === true ? 1 : 0.4,
            color: isDark ? '#ffffff' : '#1a1a1a',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {data.option1}
        </span>
        <span
          className={classes.inputOption}
          onClick={() => !disabled && handleinput(false, data.option)}
          style={{ 
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: compact ? 12 : 14,
            fontWeight: 600,
            opacity: input === false ? 1 : 0.4,
            color: isDark ? '#ffffff' : '#1a1a1a',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {data.option2}
        </span>
      </div>
    </div>
  );
};

export default Option;
