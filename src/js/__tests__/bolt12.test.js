import { describe, expect, it } from "vitest";
import { decodeBolt12Offer } from "src/js/bolt12";

describe("BOLT12 helpers", () => {
  it("decodes offers whose blinded path starts with a short-channel-id introduction node", () => {
    const offer =
      "lno1pgqppdcqpckysqq9rcqqqq7dttdacz3dsxc3qcm0y2lkw9l9229qvg5d7zf4829z4mg095nlh5pqyhvjfmelj7llrfgyea3nnnp3v6rk3lefq8mgjzduzwz38vztrw0kqqdfewzcfgp2nvjjvtcc8t96h5kp73wxmm5rqe5en2aa6q4c32de3ddqjpl2jzsfvmvtm6zsjrxptmzklp54qrza84ft2ynu5qqzekx0xtzw3799mnyw0dwqr2c8us457m6u5w485qfdzknczjg9kkmzt5vaag8pv6pwkjvdgdcpvggrh5zuzwn2kjsshpnzued5lguypx0f3xzseq4un7fuf27uwq6s8rrq";

    expect(decodeBolt12Offer(offer)).toEqual({
      amount: undefined,
      description: "",
      currency: undefined,
      issuer: undefined,
      issuer_id:
        "03bd05c13a6ab4a10b8662e65b4fa384099e989850c82bc9f93c4abdc7035038c6",
    });
  });
});
