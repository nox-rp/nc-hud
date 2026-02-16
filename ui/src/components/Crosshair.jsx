import React, { useState } from "react";
import { createStyles } from "@mantine/emotion";
import Fade from "../utils/fade";
import { NuiEvent } from "../hooks/NuiEvent";

const useStyles = createStyles((theme) => ({
  crosshairContainer: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 60,
    height: 60,
    pointerEvents: "none",
    zIndex: 9999,
  },
  
  crosshairCorner: {
    position: "absolute",
    width: 12,
    height: 12,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderStyle: "solid",
    borderWidth: 0,
  },
  
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
}));

const Crosshair = () => {
  const { classes } = useStyles();
  const [show, setShow] = useState(false);

  const handleWeapon = (data) => {
    // Only show crosshair when aiming is true and show is true
    if (data.aiming !== undefined && data.show !== undefined) {
      setShow(data.aiming && data.show);
    } else if (data.aiming !== undefined) {
      setShow(data.aiming);
    }
    // Hide crosshair if show is false
    if (data.show === false) {
      setShow(false);
    }
  };

  NuiEvent("weapon", handleWeapon);

  return (
    <Fade in={show}>
      <div className={`${classes.crosshairContainer} nox-crosshair`}>
        <div className={`${classes.crosshairCorner} ${classes.cornerTopLeft}`} />
        <div className={`${classes.crosshairCorner} ${classes.cornerTopRight}`} />
        <div className={`${classes.crosshairCorner} ${classes.cornerBottomLeft}`} />
        <div className={`${classes.crosshairCorner} ${classes.cornerBottomRight}`} />
      </div>
    </Fade>
  );
};

export default Crosshair;
