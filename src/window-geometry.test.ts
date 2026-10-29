import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bottomCenterIn, clampToArea, layoutForBounds, resizeAnchored } from "./window-geometry.ts";

describe("window geometry", () => {
  const current = { x: 100, y: 900, width: 400, height: 100 };
  const size = { width: 480, height: 460 };

  it("keeps the bottom edge and horizontal center when resizing", () => {
    assert.deepEqual(resizeAnchored(current, size, "bottom"), { x: 60, y: 540, width: 480, height: 460 });
  });

  it("keeps the side edge and vertical center for a vertical dock", () => {
    assert.deepEqual(resizeAnchored(current, size, "left"), { x: 100, y: 720, width: 480, height: 460 });
    assert.deepEqual(resizeAnchored(current, size, "right"), { x: 20, y: 720, width: 480, height: 460 });
    assert.deepEqual(resizeAnchored(current, size, "center"), { x: 60, y: 720, width: 480, height: 460 });
  });

  it("keeps a window inside the work area of a secondary monitor", () => {
    const area = { x: -1920, y: 0, width: 1920, height: 1040 };

    assert.deepEqual(
      clampToArea({ x: -2000, y: 900, width: 400, height: 300 }, area),
      { x: -1920, y: 740, width: 400, height: 300 },
    );
    assert.deepEqual(
      clampToArea({ x: -300, y: -50, width: 400, height: 300 }, area),
      { x: -400, y: 0, width: 400, height: 300 },
    );
  });

  it("places the dock at the bottom center of a monitor", () => {
    const placed = bottomCenterIn(
      { x: 1920, y: 0, width: 2560, height: 1400 },
      { width: 400, height: 120 },
      16,
    );

    assert.deepEqual(placed, { x: 3000, y: 1264, width: 400, height: 120 });
  });

  it("turns vertical only when the window reaches a side of the monitor", () => {
    const area = { x: 1920, y: 0, width: 1920, height: 1040 };
    const at = (x: number) => ({ x, y: 400, width: 500, height: 120 });

    assert.equal(layoutForBounds(at(1900), area, 8), "left");
    assert.equal(layoutForBounds(at(1925), area, 8), "left");
    assert.equal(layoutForBounds(at(1940), area, 8), "horizontal");
    assert.equal(layoutForBounds(at(3335), area, 8), "right");
    assert.equal(layoutForBounds(at(3300), area, 8), "horizontal");
  });
});
