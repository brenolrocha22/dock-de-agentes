export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

// Horizontal flutua em qualquer lugar; "left" e "right" ficam presos à lateral do monitor.
export type DockLayout = "horizontal" | "left" | "right";

// Ponto da janela que fica parado quando ela muda de tamanho.
export type ResizeAnchor = "bottom" | "left" | "right" | "center";

export function anchorFor(layout: DockLayout): ResizeAnchor {
  return layout === "horizontal" ? "bottom" : layout;
}

export function resizeAnchored(current: Rect, size: Size, anchor: ResizeAnchor): Rect {
  const centerX = Math.round(current.x + (current.width - size.width) / 2);
  const centerY = Math.round(current.y + (current.height - size.height) / 2);
  switch (anchor) {
    case "bottom":
      return { ...size, x: centerX, y: current.y + current.height - size.height };
    case "left":
      return { ...size, x: current.x, y: centerY };
    case "right":
      return { ...size, x: current.x + current.width - size.width, y: centerY };
    case "center":
      return { ...size, x: centerX, y: centerY };
  }
}

export function clampToArea(rect: Rect, area: Rect): Rect {
  return {
    ...rect,
    x: Math.max(area.x, Math.min(rect.x, area.x + area.width - rect.width)),
    y: Math.max(area.y, Math.min(rect.y, area.y + area.height - rect.height)),
  };
}

export function bottomCenterIn(area: Rect, size: Size, margin: number): Rect {
  return {
    x: Math.round(area.x + (area.width - size.width) / 2),
    y: area.y + area.height - size.height - margin,
    width: size.width,
    height: size.height,
  };
}

// Encostar (ou passar) da lateral da área útil prende o dock na vertical.
export function layoutForBounds(window: Rect, area: Rect, threshold: number): DockLayout {
  if (window.x <= area.x + threshold) return "left";
  if (window.x + window.width >= area.x + area.width - threshold) return "right";
  return "horizontal";
}
