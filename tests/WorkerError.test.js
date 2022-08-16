import { it, expect } from "bun:test"
const { WorkerError } = require("../src/WorkerError")

it("is an error", () => {
  try {
    expect(new WorkerError()).toBeInstanceOf(Error)
  } catch {
    expect(new WorkerError() instanceof Error).toBe(true)
  }
})

it("extends Error predictably", () => {
  try {
    try {
      throw new Error("Foo")
    } catch (e) {
      throw new WorkerError(e.message)
    }
  } catch (e) {
    expect(e.message).toBe("Foo")
  }
})

it("has a name containing filename", () => {
  expect(new WorkerError("Foo").name).toContain("undefined")
  expect(new WorkerError("Foo", "file.js").name).toContain("file.js")
})
