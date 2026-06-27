import sharp from "sharp";

const DEFAULT_MAX_LONG_EDGE = 1600;
const DEFAULT_MAX_SUBMITTED_BYTES = 4 * 1024 * 1024;
const DEFAULT_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const DEFAULT_JPEG_QUALITY = 82;
const DEFAULT_ALLOWED_IMAGE_HOSTS = ["www.nps.gov"];
const DEFAULT_TIMEOUT_MS = 10000;

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
    maxSubmittedBytes?: number;
    maxSourceBytes?: number;
    jpegQuality?: number;
    allowedHosts?: string[];
    timeoutMs?: number;
  } = {}
): Promise<NormalizedImage> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxSubmittedBytes = options.maxSubmittedBytes ?? options.maxBase64Bytes ?? DEFAULT_MAX_SUBMITTED_BYTES;
  const maxSourceBytes = options.maxSourceBytes ?? DEFAULT_MAX_SOURCE_BYTES;
  const jpegQuality = options.jpegQuality ?? DEFAULT_JPEG_QUALITY;
  const trustedUrl = trustedImageUrl(imageUrl, options.allowedHosts ?? allowedImageHostsFromEnvironment());
  const response = await fetchImpl(trustedUrl, {
    redirect: "error",
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Image normalization failed to fetch source image with HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`Image normalization rejected non-image content type: ${contentType}.`);
  }

  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > maxSourceBytes) {
    throw new Error(`Image normalization rejected source image larger than ${maxSourceBytes} bytes.`);
  }

  const originalBuffer = Buffer.from(await response.arrayBuffer());
  if (originalBuffer.byteLength > maxSourceBytes) {
    throw new Error(`Image normalization rejected source image larger than ${maxSourceBytes} bytes.`);
  }

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

  if (!plan.resized) {
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
    maxSubmittedBytes,
    jpegQuality
  });
  const submittedMetadata = await sharp(normalized.buffer).metadata();

  return {
    imageUrl: normalized.dataUrl,
    metadata: {
      originalImageUrl: imageUrl,
      originalWidth: originalMetadata.width,
      originalHeight: originalMetadata.height,
      originalBytes: originalBuffer.byteLength,
      submittedWidth: submittedMetadata.width ?? plan.width,
      submittedHeight: submittedMetadata.height ?? plan.height,
      submittedBytes: normalized.submittedBytes,
      resized: true,
      reason: plan.resized ? "oversized_dimensions" : "oversized_payload"
    }
  };
}

async function resizeToBudget(
  originalBuffer: Buffer,
  options: { width: number; height: number; maxSubmittedBytes: number; jpegQuality: number }
): Promise<{ buffer: Buffer; dataUrl: string; submittedBytes: number }> {
  let width = options.width;
  let height = options.height;
  let quality = options.jpegQuality;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const output = await sharp(originalBuffer)
      .rotate()
      .resize({ width, height, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
    const dataUrl = `data:image/jpeg;base64,${output.toString("base64")}`;
    const submittedBytes = Buffer.byteLength(dataUrl, "utf8");

    if (submittedBytes <= options.maxSubmittedBytes) return { buffer: output, dataUrl, submittedBytes };

    width = Math.max(1, Math.round(width * 0.75));
    height = Math.max(1, Math.round(height * 0.75));
    quality = Math.max(60, quality - 8);
  }

  throw new Error("Image normalization could not create a Groq-safe image under the base64 payload limit.");
}

function allowedImageHostsFromEnvironment(): string[] {
  const configured = process.env.CSG_ALLOWED_IMAGE_HOSTS?.split(",").map((host) => host.trim()).filter(Boolean) ?? [];
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_IMAGE_HOSTS;
}

function trustedImageUrl(imageUrl: string, allowedHosts: string[]): string {
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error("Image normalization rejected untrusted image URL.");
  }

  const hostname = parsed.hostname.toLowerCase();
  const allowed = new Set(allowedHosts.map((host) => host.toLowerCase()));
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || !allowed.has(hostname)) {
    throw new Error("Image normalization rejected untrusted image URL.");
  }

  return parsed.toString();
}
