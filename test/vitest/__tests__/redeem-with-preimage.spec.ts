import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ChatMessageBubble from "../../../src/components/ChatMessageBubble.vue";

const redeemMock = vi.fn();

vi.mock("../../../src/stores/wallet", () => ({
  useWalletStore: () => ({ redeem: redeemMock }),
}));

vi.mock("../../../src/stores/receiveTokensStore", () => ({
  useReceiveTokensStore: () => ({ receiveData: {} }),
}));

vi.mock("../../../src/stores/dexie", () => ({
  cashuDb: { lockedTokens: { where: vi.fn().mockReturnValue({ equals: () => ({ first: vi.fn().mockResolvedValue(null) }) }) }, subscriptions: { get: vi.fn().mockResolvedValue(null) } },
}));

vi.mock("../../../src/stores/p2pk", () => ({ useP2PKStore: () => ({ getTokenPubkey: vi.fn(() => ""), getTokenLocktime: vi.fn(() => 0) }) }));

vi.mock("../../../src/js/notify", () => ({ notifyError: vi.fn() }));

const TokenCarouselStub = {
  template: "<div></div>",
  emits: ["redeem"],
};

describe("redeem payment", () => {
  it("calls wallet.redeem", async () => {
    const payment = { token: "tok", preimage: "secret123", month_index: 1, total_months: 1, subscription_id: "s", tier_id: "t", amount: 1 };
    const wrapper = mount(ChatMessageBubble, {
      props: { message: { id: "1", pubkey: "p", content: "", created_at: 0, outgoing: false, subscriptionPayment: payment } },
      global: { stubs: { TokenCarousel: TokenCarouselStub } },
    });

    await wrapper.findComponent(TokenCarouselStub).vm.$emit("redeem", payment);

    expect(redeemMock).toHaveBeenCalledWith("tok");
  });
});
