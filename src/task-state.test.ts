import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initialTaskState, taskReducer } from "./task-state.ts";

describe("task execution state", () => {
  it("moves from idle to running and completed", () => {
    const running = taskReducer(initialTaskState, {
      type: "start",
      task: "  Organizar uma ideia  ",
    });

    assert.deepEqual(running, { status: "running", task: "Organizar uma ideia" });
    assert.deepEqual(taskReducer(running, { type: "complete" }), {
      status: "completed",
      task: "Organizar uma ideia",
    });
  });

  it("ignores an empty task and completion before a run", () => {
    assert.equal(taskReducer(initialTaskState, { type: "start", task: "  " }), initialTaskState);
    assert.equal(taskReducer(initialTaskState, { type: "complete" }), initialTaskState);
  });

  it("returns to idle when reset", () => {
    const running = taskReducer(initialTaskState, { type: "start", task: "Escrever" });
    assert.equal(taskReducer(running, { type: "reset" }), initialTaskState);
  });
});
