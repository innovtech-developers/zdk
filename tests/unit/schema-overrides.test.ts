import { describe, expect, it } from "vitest";
import { CONNECTION_STATUS, isUsableConnectionStatus } from "../../src/schema/overrides";

describe("CONNECTION_STATUS / isUsableConnectionStatus", () => {
  it("é congelado", () => {
    expect(Object.isFrozen(CONNECTION_STATUS)).toBe(true);
  });

  it("CONNECTED e WHATSAPP_AUTH são utilizáveis", () => {
    expect(isUsableConnectionStatus(CONNECTION_STATUS.connected)).toBe(true);
    expect(isUsableConnectionStatus(CONNECTION_STATUS.whatsappAuth)).toBe(true);
  });

  it("DISCONNECTED e TIMEOUT não são utilizáveis", () => {
    expect(isUsableConnectionStatus(CONNECTION_STATUS.disconnected)).toBe(false);
    expect(isUsableConnectionStatus(CONNECTION_STATUS.timeout)).toBe(false);
  });
});
