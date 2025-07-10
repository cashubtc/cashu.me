import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NostrMessenger from "../../../src/pages/NostrMessenger.vue";

const openConversation = vi.fn();

vi.mock("../../../src/stores/messenger", () => ({
  useMessengerStore: () => ({
    drawerOpen: false,
    conversations: {},
    openConversation,
    loadIdentity: vi.fn(),
    start: vi.fn(),
    setDrawer: vi.fn(),
    markRead: vi.fn(),
    createConversation: vi.fn(),
    setCurrentConversation: vi.fn(),
  }),
}));

vi.mock("../../../src/stores/nostr", () => ({ useNostrStore: () => ({ initSignerIfNotSet: vi.fn() }) }));
vi.mock("../../../src/composables/useNdk", () => ({ useNdk: vi.fn() }));

vi.mock("vue-router", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  useRoute: () => ({ query: { peer: "npub1abcd" } }),
}));

describe("NostrMessenger route", () => {
  it("opens conversation from query param", async () => {
    mount(NostrMessenger, {
      global: {
        stubs: {
          NostrIdentityManager: true,
          RelayManager: true,
          NewChat: true,
          ConversationList: true,
          ActiveChatHeader: true,
          MessageList: true,
          MessageInput: true,
          ChatSendTokenDialog: true,
        },
      },
    });
    expect(openConversation).toHaveBeenCalledWith("npub1abcd");
  });
});
