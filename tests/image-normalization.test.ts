import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { normalizeImageForGroq, planImageResize } from "../src/server/extraction/image-normalization";

describe("image normalization", () => {
  it("plans a proportional resize for oversized source frames", () => {
    const plan = planImageResize({ width: 8640, height: 5760, maxLongEdge: 1600 });

    expect(plan.resized).toBe(true);
    expect(plan.width).toBe(1600);
    expect(plan.height).toBe(1067);
  });

  it("keeps small frames unchanged when they fit the target envelope", () => {
    const plan = planImageResize({ width: 1200, height: 800, maxLongEdge: 1600 });

    expect(plan.resized).toBe(false);
    expect(plan.width).toBe(1200);
    expect(plan.height).toBe(800);
  });

  it("returns a Groq-safe data URL with normalization metadata", async () => {
    const original = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 3,
        background: { r: 40, g: 80, b: 120 }
      }
    }).jpeg().toBuffer();

    const normalized = await normalizeImageForGroq("https://example.test/frame.jpg", {
      fetchImpl: async () => new Response(new Blob([new Uint8Array(original)]), { status: 200 }),
      maxLongEdge: 40,
      jpegQuality: 80
    });

    expect(normalized.imageUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect(normalized.metadata.originalWidth).toBe(120);
    expect(normalized.metadata.originalHeight).toBe(80);
    expect(normalized.metadata.submittedWidth).toBe(40);
    expect(normalized.metadata.submittedHeight).toBe(27);
    expect(normalized.metadata.resized).toBe(true);
  });
});
