import { describe, expect, it } from "vitest";
import { escapeHtml } from "./email-html";

describe("escapeHtml", () => {
  it("leaves ordinary text alone", () => {
    expect(escapeHtml("Dinamo Zagreb")).toBe("Dinamo Zagreb");
  });

  it("escapes the five characters that break out of markup", () => {
    expect(escapeHtml(`<b>&"'`)).toBe("&lt;b&gt;&amp;&quot;&#39;");
  });

  it("escapes the ampersand before the entities it introduces", () => {
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("neutralises a team name carrying its own link", () => {
    const injected = `Reds</p><a href="http://evil.example">Click</a><p>`;
    expect(escapeHtml(injected)).not.toContain("<a href");
  });
});
