import { sourceEventSchema, type SourceEvent } from "../../shared/schema";

type NpsWebcamResponse = {
  total?: string;
  data?: Array<{
    id?: string;
    title?: string;
    description?: string;
    url?: string;
    relatedParks?: Array<{ parkCode?: string; fullName?: string }>;
    images?: Array<{ url?: string; altText?: string; caption?: string; credit?: string }>;
  }>;
};

export type ProbeResult =
  | { ok: true; source: SourceEvent }
  | { ok: false; status: "missing_key" | "no_camera" | "fetch_failed"; detail: string };

export const defaultNpsWebcamTitle = "Peregrine Falcon";

export async function probeNpsWebcamSource(options: {
  apiKey?: string;
  parkCode?: string;
  webcamId?: string;
  titleIncludes?: string;
  fetchImpl?: typeof fetch;
} = {}): Promise<ProbeResult> {
  const apiKey = options.apiKey ?? process.env.NPS_API_KEY;
  const webcamId = options.webcamId ?? process.env.NPS_WEBCAM_ID;
  const titleIncludes = options.titleIncludes ?? process.env.NPS_WEBCAM_TITLE ?? defaultNpsWebcamTitle;
  const parkCode = options.parkCode ?? (webcamId || titleIncludes ? undefined : process.env.NPS_PARK_CODE ?? "yell");
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!apiKey) {
    return {
      ok: false,
      status: "missing_key",
      detail: "NPS webcam API requires NPS_API_KEY. The unauthenticated endpoint returns API_KEY_MISSING."
    };
  }

  const url = new URL("https://developer.nps.gov/api/v1/webcams");
  if (parkCode && !webcamId && !titleIncludes) url.searchParams.set("parkCode", parkCode);
  url.searchParams.set("limit", webcamId || titleIncludes ? "500" : "10");
  url.searchParams.set("api_key", apiKey);

  const response = await fetchImpl(url);
  if (!response.ok) {
    return {
      ok: false,
      status: "fetch_failed",
      detail: `NPS webcam probe failed with HTTP ${response.status}.`
    };
  }

  const json = (await response.json()) as NpsWebcamResponse;
  const webcam = selectWebcam(json.data ?? [], { webcamId, titleIncludes });
  const image = webcam?.images?.find((item) => item.url);

  if (!webcam || !image?.url) {
    return {
      ok: false,
      status: "no_camera",
      detail: `No webcam image URL found for parkCode=${parkCode}.`
    };
  }

  return {
    ok: true,
    source: sourceEventSchema.parse({
      sourceId: `nps:${webcam.id ?? parkCode}`,
      sourceName: webcam.title ?? `NPS ${parkCode} webcam`,
      sourceType: "live_camera",
      capturedAt: new Date().toISOString(),
      imageUrl: normalizeNpsUrl(image.url),
      locationLabel: webcam.relatedParks?.[0]?.fullName ?? `NPS park ${parkCode}`,
      sourcePageUrl: normalizeNpsUrl(webcam.url) ?? "https://www.nps.gov/subjects/developer/api-documentation.htm",
      licenseOrTermsRef: "NPS API and DOI/NPS notices; confirm camera-specific credits before public redistribution.",
      termsStatus: "requires_key",
      notes: image.caption ?? webcam.description ?? image.altText
    })
  };
}

function selectWebcam(
  webcams: NonNullable<NpsWebcamResponse["data"]>,
  target: { webcamId?: string; titleIncludes?: string }
) {
  const imageBearing = webcams.filter((item) => item.images?.some((image) => image.url));
  const idNeedle = target.webcamId?.trim().toLowerCase();
  const titleNeedle = target.titleIncludes?.trim().toLowerCase();

  if (idNeedle) {
    const exact = imageBearing.find((item) => item.id?.toLowerCase() === idNeedle);
    if (exact) return exact;
  }

  if (titleNeedle) {
    const titleMatch = imageBearing.find((item) => item.title?.toLowerCase().includes(titleNeedle));
    if (titleMatch) return titleMatch;
  }

  return imageBearing[0];
}

function normalizeNpsUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const duplicatePrefix = "https://www.nps.govhttps://www.nps.gov";
  if (value.startsWith(duplicatePrefix)) return value.replace(duplicatePrefix, "https://www.nps.gov");
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `https://www.nps.gov${value}`;
  return value;
}
