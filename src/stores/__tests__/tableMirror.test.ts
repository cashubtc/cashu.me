import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { cashuDb } from "src/stores/dexie";
import { createTableMirror, toMirrorRows } from "src/stores/tableMirror";

type Item = { id: string; value: number; tags?: string[] };

const table = () => cashuDb.paymentRequests;
const mirror = () =>
  createTableMirror<Item>(table(), { keyOf: (item) => item.id });

describe("table mirror", () => {
  beforeEach(async () => {
    await table().clear();
  });

  it("does not write before it is hydrated", async () => {
    await table().bulkPut(toMirrorRows([{ id: "stored", value: 1 }]));
    const m = mirror();
    m.items.value = [];
    await m.flush();
    expect(await table().count()).toBe(1);
  });

  it("loads stored rows in their saved order", async () => {
    await table().bulkPut(
      toMirrorRows([
        { id: "b", value: 2 },
        { id: "a", value: 1 },
      ])
    );
    const m = mirror();
    await m.hydrate();
    expect(m.items.value.map((item) => item.id)).toEqual(["b", "a"]);
    expect(m.items.value[0]).toEqual({ id: "b", value: 2 });
  });

  it("writes pushes, in-place edits and removals through to the table", async () => {
    const m = mirror();
    await m.hydrate();
    m.items.value.push({ id: "a", value: 1, tags: [] });
    m.items.value.push({ id: "b", value: 2 });
    await m.flush();
    expect(await table().count()).toBe(2);

    m.items.value[0].tags!.push("x");
    m.items.value[1].value = 3;
    await m.flush();
    expect(await table().get("a")).toMatchObject({ tags: ["x"] });
    expect(await table().get("b")).toMatchObject({ value: 3 });

    m.items.value.splice(0, 1);
    await m.flush();
    expect(await table().get("a")).toBeUndefined();
    expect(await table().get("b")).toMatchObject({ value: 3, _pos: 0 });

    m.items.value = [];
    await m.flush();
    expect(await table().count()).toBe(0);
  });

  it("keeps items added before hydration and persists them", async () => {
    await table().bulkPut(
      toMirrorRows([
        { id: "stored", value: 1 },
        { id: "both", value: 1 },
      ])
    );
    const m = mirror();
    m.items.value.push({ id: "early", value: 2 }, { id: "both", value: 9 });
    await m.hydrate();
    await m.flush();
    expect(m.items.value.map((item) => item.id)).toEqual([
      "stored",
      "early",
      "both",
    ]);
    expect(await table().get("early")).toMatchObject({ value: 2 });
    expect(await table().get("both")).toMatchObject({ value: 9 });
  });

  it("survives a reload", async () => {
    const first = mirror();
    await first.hydrate();
    first.items.value.push({ id: "a", value: 1 }, { id: "b", value: 2 });
    await first.flush();

    const second = mirror();
    await second.hydrate();
    expect(second.items.value).toEqual([
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ]);
  });
});
