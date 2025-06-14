import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDmChatsStore } from "../../../src/stores/dmChats";

vi.mock("../../../src/js/message-utils", () => ({
  sanitizeMessage: vi.fn((s: string) => s),
}));

beforeEach(() => {
  localStorage.clear();
});

describe("DM chats store", () => {
  it("loads chats from localStorage", () => {
    localStorage.setItem("cashu.dmChats", JSON.stringify({ a: [{ id: "1" }] }));
    localStorage.setItem("cashu.dmChats.unread", JSON.stringify({ a: 2 }));
    const store = useDmChatsStore();
    store.loadChats();
    expect(store.chats.a.length).toBe(1);
    expect(store.unreadCounts.a).toBe(2);
  });

  it("adds incoming message and increments unread", () => {
    const store = useDmChatsStore();
    store.addIncoming({
      id: "1",
      pubkey: "pk",
      content: "hi",
      created_at: 1,
    } as any);
    expect(store.chats.pk.length).toBe(1);
    expect(store.unreadCounts.pk).toBe(1);
  });

  it("adds outgoing message", () => {
    const store = useDmChatsStore();
    store.addOutgoing({
      id: "1",
      content: "hi",
      created_at: 1,
      tags: [["p", "pk"]],
    } as any);
    expect(store.chats.pk.length).toBe(1);
    expect(store.chats.pk[0].outgoing).toBe(true);
  });

  it("marks chat read", () => {
    const store = useDmChatsStore();
    store.unreadCounts.pk = 5;
    store.markChatRead("pk");
    expect(store.unreadCounts.pk).toBe(0);
  });
});
