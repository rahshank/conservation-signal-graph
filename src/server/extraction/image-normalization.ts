import sharp from "sharp";

const DEFAULT_MAX_LONG_EDGE = 1600;
const DEFAULT_MAX_BASE64_BYTES = 4 * 1024 * 1024;
const DEFAULT_JPEG_QUALITY = 82;

export type ImageNormalizationMetadata = {
  originalImageUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalBytes: number;
  submittedWidth: number;
  submittedHeight: number;
  submittedBytes: number;
  resized: boolean;
  reason: "within_limits" | "oversized_dimensions" | "oversized_payload";
};

export type NormalizedImage = {
  imageUrl: string;
  metadata: ImageNormalizationMetadata;
};

export function planImageResize(options: {
  width: number;
  height: number;
  maxLongEdge?: number;
}): { width: number; height: number; resized: boolean } {
  const maxLongEdge = options.maxLongEdge ?? DEFAULT_MAX_LONG_EDGE;
  const longEdge = Math.max(options.width, options.height);

  if (longEdge <= maxLongEdge) {
    return { width: options.width, height: options.height, resized: false };
  }

  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(options.width * scale)),
    height: Math.max(1, Math.round(options.height * scale)),
    resized: true
  };
}

export async function normalizeImageForGroq(
  imageUrl: string,
  options: {
    fetchImpl?: typeof fetch;
    maxLongEdge?: number;
    maxBase64Bytes?: number;
    jpegQuality?: number;
  } = {}
): Promise<NormalizedImage> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxBase64Bytes = options.maxBase64Bytes ?? DEFAULT_MAX_BASE64_BYTES;
  const jpegQuality = options.jpegQuality ?? DEFAULT_JPEG_QUALITY;
  const response = await fetchImpl(imageUrl);

  if (!response.ok) {
    throw new Error(`Image normalization failed to fetch source image with HTTP ${response.status}.`);
  }

  const originalBuffer = Buffer.from(await response.arrayBuffer());
  const originalMetadata = await sharp(originalBuffer).metadata();
  if (!originalMetadata.width || !originalMetadata.height) {
    throw new Error("Image normalization could not determine source image dimensions.");
  }

  const plan = planImageResize({
    width: originalMetadata.width,
    height: originalMetadata.height,
    maxLongEdge: options.maxLongEdge
  });
  const reason = plan.resized ? "oversized_dimensions" : "within_limits";

  if (!plan.resized && originalBuffer.byteLength <= maxBase64Bytes) {
    return {
      imageUrl,
      metadata: {
        originalImageUrl: imageUrl,
        originalWidth: originalMetadata.width,
        originalHeight: originalMetadata.height,
        originalBytes: originalBuffer.byteLength,
        submittedWidth: originalMetadata.width,
        submittedHeight: originalMetadata.height,
        submittedBytes: originalBuffer.byteLength,
        resized: false,
        reason
      }
    };
  }

  const normalized = await resizeToBudget(originalBuffer, {
    width: plan.width,
    height: plan.height,
    maxBase64Bytes,
    jpegQuality
  });
  const submittedMetadata = await sharp(normalized).metadata();

  return {
    imageUrl: `data:image/jpeg;base64,${normalized.toString("base64")}`,
    metadata: {
      originalImageUrl: imageUrl,
      originalWidth: originalMetadata.width,
      originalHeight: originalMetadata.height,
      originalBytes: originalBuffer.byteLength,
      submittedWidth: submittedMetadata.width ?? plan.width,
      submittedHeight: submittedMetadata.height ?? plan.height,
      submittedBytes: normalized.byteLength,
      resized: true,
      reason: plan.resized ? "oversized_dimensions" : "oversized_payload"
    }
  };
}

async function resizeToBudget(
  originalBuffer: Buffer,
  options: { width: number; height: number; maxBase64Bytes: number; jpegQuality: number }
): Promise<Buffer> {
  let width = options.width;
  let height = options.height;
  let quality = options.jpegQuality;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const output = await sharp(originalBuffer)
      .rotate()
      .resize({ width, height, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    if (output.byteLength <= options.maxBase64Bytes) return output;

    width = Math.max(1, Math.round(width * 0.8));
    height = Math.max(1, Math.round(height * 0.8));
    quality = Math.max(60, quality - 8);
  }

  throw new Error("Image normalization could not create a Groq-safe image under the base64 payload limit.");
}
