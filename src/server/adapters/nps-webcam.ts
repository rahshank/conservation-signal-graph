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

export async function probeNpsWebcamSource(options: {
  apiKey?: string;
  parkCode?: string;
  fetchImpl?: typeof fetch;
} = {}): Promise<ProbeResult> {
  const apiKey = options.apiKey ?? process.env.NPS_API_KEY;
  const parkCode = options.parkCode ?? process.env.NPS_PARK_CODE ?? "yell";
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!apiKey) {
    return {
      ok: false,
      status: "missing_key",
      detail: "NPS webcam API requires NPS_API_KEY. The unauthenticated endpoint returns API_KEY_MISSING."
    };
  }

  const url = new URL("https://developer.nps.gov/api/v1/webcams");
  url.searchParams.set("parkCode", parkCode);
  url.searchParams.set("limit", "10");
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
  const webcam = json.data?.find((item) => item.images?.some((image) => image.url));
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
      imageUrl: image.url,
      locationLabel: webcam.relatedParks?.[0]?.fullName ?? `NPS park ${parkCode}`,
      sourcePageUrl: webcam.url ?? "https://www.nps.gov/subjects/developer/api-documentation.htm",
      licenseOrTermsRef: "NPS API and DOI/NPS notices; confirm camera-specific credits before public redistribution.",
      termsStatus: "requires_key",
      notes: image.caption ?? webcam.description ?? image.altText
    })
  };
}
