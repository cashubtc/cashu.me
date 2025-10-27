import token from "../token";
import { describe, expect, it } from "vitest";

const VALID_V4_TOKEN =
  "cashuBo2FteCJodHRwczovL21pbnQubWluaWJpdHMuY2FzaC9CaXRjb2luYXVjc2F0YXSBomFpSABQBVDwSUFGYXCBpGFhAWFzeEBiMjBjYjNkZmZjMzY0ZWQ2ZDhiNWIzZjAzNDEzODQ4ZDU2MTZhMmZiMGMxZGEyMDNlN2ExYTNlNzM4NzBhNWJjYWNYIQIBBWMjM-FXqkXqHeiQMsK24hFzqeittTtTRBv9o6-LO2Fko2FlWCC49Cmyit61XiLZeotP_058iw6Av1Du2r3HY4oNoU1ws2FzWCDb9bMQubjVh9BzuQPP2JyEE0pExaEk6Vk8-h_c3UofuGFyWCCwhsZx88PRY9DMO5h6uiT140WF9zgBKNUrvcY3ssEHmA";
const VALID_V3_TOKEN =
  "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJpZCI6IkkyeU4raVJZZmt6VCIsImFtb3VudCI6MSwiQyI6IjAyZTRkYmJmMGZmNDI4YTU4ZDZjNjZjMTljNjI0YWRlY2MxNzg0YzdlNTU5ODZhNGVmNDQ4NDM5MzZhM2M4ZjM1OSIsInNlY3JldCI6ImZHWVpzSlVjME1mU1orVlhGandEZXNsNkJScW5wNmRSblZpUGQ2L00yQ0k9In1dLCJtaW50IjoiaHR0cHM6Ly84MzMzLnNwYWNlOjMzMzgifV19";
const VALID_V2_TOKEN =
  "eyJwcm9vZnMiOlt7ImlkIjoiSTJ5TitpUllma3pUIiwiYW1vdW50IjoxLCJDIjoiMDNjMzAwYzMzMzAzNTMzNDA3MjYwMzU3MzA3NzViNGM2YjRlMDRlYmVjOGY2OGVmYzVmYjY2ZDE3OTI0ZDRkMmQyIiwic2VjcmV0IjoicjE5S3I1anlwQXNaWm1tOUg3cUtFQWJsc1c1ZmsxaWsycFQwUWs2TFUxWT0ifV0sIm1pbnRzIjpbeyJ1cmwiOiJodHRwczovLzgzMzMuc3BhY2U6MzMzOCIsImlkcyI6WyJMM3p4eFJCL0k4dUUiLCJJMnlOK2lSWWZrelQiXX1dfQ==";

describe("token", () => {
  describe("decode", () => {
    it("should properly decode a V4 token", () => {
      const decoded = token.decode(VALID_V4_TOKEN);
      expect(decoded.proofs.length).toEqual(1);
      expect(decoded.mint).toEqual("https://mint.minibits.cash/Bitcoin");
      expect(decoded.proofs.length).toEqual(1);
    });

    it("should properly decode a V3 token", () => {
      const decoded = token.decode(VALID_V3_TOKEN);
      expect(decoded.proofs.length).toEqual(1);
      expect(decoded.mint).toEqual("https://8333.space:3338");
      expect(decoded.proofs.length).toEqual(1);
    });

    it("should throw unsupported token error for a V2 token", () => {
      expect(() => token.decode(VALID_V2_TOKEN)).toThrow(
        "Token version is not supported"
      );
    });
  });

  it("should throw if the token is invalid or V2", () => {
    expect(() => token.decode("invalid")).toThrow();
  });
});
