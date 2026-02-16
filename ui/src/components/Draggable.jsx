import React, { useRef, useCallback, useState, cloneElement } from "react";
import { createStyles } from "@mantine/emotion";
import { useHudPosition } from "../providers/hudpositionprovider";
import { useTheme } from "../providers/themeprovider";

const useStyles = createStyles(() => ({
  editOverlay: {
    position: "fixed",
    cursor: "move",
    zIndex: 9998,
  },
  dragging: {
    outline: "2px solid rgba(76, 175, 80, 1) !important",
  },
  label: {
    position: "absolute",
    top: "-20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 600,
    color: "#fff",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: 9999,
  },
}));

const Draggable = ({ id, label, children }) => {
  const { classes, cx } = useStyles();
  const { editMode, updatePosition, getPosition } = useHudPosition();
  const { isDark } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const overlayRef = useRef(null);
  const childRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  const position = getPosition(id) || { x: 0, y: 0 };

  const handleMouseDown = useCallback(
    (e) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      startPos.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startPos.current.x;
        const deltaY = moveEvent.clientY - startPos.current.y;
        startPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        updatePosition(id, { x: deltaX, y: deltaY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editMode, id, updatePosition]
  );

  // Add offset to children's original style
  const childStyle = children.props?.style || {};
  const originalTransform = childStyle.transform || "";
  const offsetTransform = position.x !== 0 || position.y !== 0 
    ? `translate(${position.x}px, ${position.y}px)` 
    : "";
  
  const combinedTransform = originalTransform && offsetTransform
    ? `${originalTransform} ${offsetTransform}`
    : (offsetTransform || originalTransform);

  const modifiedChild = cloneElement(children, {
    ref: childRef,
    style: {
      ...childStyle,
      transform: combinedTransform || childStyle.transform,
    },
  });

  // If not in editMode, return only modified children
  if (!editMode) {
    return modifiedChild;
  }

  // When in editMode: drag overlay + modified children
  return (
    <>
      {modifiedChild}
      {/* Drag handle overlay - displayed above actual element */}
      <div
        ref={overlayRef}
        className={cx(classes.editOverlay, isDragging && classes.dragging)}
        style={{
          // Overlay is displayed at the same position as children
          // Should use children's getBoundingClientRect, but
          // Here we simply handle it with pointer-events
          pointerEvents: "auto",
          outline: `2px dashed ${isDark ? 'rgba(249, 54, 57, 0.7)' : 'rgba(249, 54, 57, 0.8)'}`,
          borderRadius: 8,
        }}
        onMouseDown={handleMouseDown}
      >
        <span 
          className={classes.label}
          style={{
            background: isDark ? 'rgba(249, 54, 57, 0.9)' : '#f93639',
          }}
        >
          {label}
        </span>
      </div>
    </>
  );
};

export default Draggable;
