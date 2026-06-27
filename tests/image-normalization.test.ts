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
      allowedHosts: ["example.test"],
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

  it("rejects untrusted image hosts before fetching", async () => {
    let fetched = false;

    await expect(
      normalizeImageForGroq("http://127.0.0.1:8080/private.jpg", {
        fetchImpl: async () => {
          fetched = true;
          return new Response(null, { status: 200 });
        }
      })
    ).rejects.toThrow("Image normalization rejected untrusted image URL");

    expect(fetched).toBe(false);
  });

  it("keeps the submitted data URL within the encoded payload budget", async () => {
    const width = 640;
    const height = 420;
    const pixels = Buffer.alloc(width * height * 3);
    for (let index = 0; index < pixels.length; index += 1) {
      pixels[index] = (index * 37) % 256;
    }
    const original = await sharp(pixels, { raw: { width, height, channels: 3 } }).jpeg({ quality: 95 }).toBuffer();
    const maxSubmittedBytes = 9000;

    const normalized = await normalizeImageForGroq("https://example.test/noisy-frame.jpg", {
      allowedHosts: ["example.test"],
      fetchImpl: async () => new Response(new Blob([new Uint8Array(original)]), { status: 200 }),
      maxLongEdge: 320,
      maxSubmittedBytes,
      jpegQuality: 95
    });

    expect(Buffer.byteLength(normalized.imageUrl, "utf8")).toBeLessThanOrEqual(maxSubmittedBytes);
    expect(normalized.metadata.submittedBytes).toBeLessThanOrEqual(maxSubmittedBytes);
  });
});
