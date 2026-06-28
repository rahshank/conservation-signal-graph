import {
  sourceCadenceEvidenceSchema,
  sourceEventSchema,
  type SourceCadenceEvidence,
  type SourceEvent,
  type SourceFreshnessObservation
} from "../../shared/schema";

type PhenoCamCamera = {
  Sitename?: string;
  active?: boolean;
  date_first?: string;
  date_last?: string;
  Lat?: number;
  Lon?: number;
  sitemetadata?: {
    site_description?: string;
    primary_veg_type?: string | null;
    secondary_veg_type?: string | null;
    site_acknowledgements?: string | null;
  };
};

type PhenoCamDailyCountsResponse = {
  results?: Array<{
    local_date?: string;
    rgb_count?: number;
    ir_count?: number;
  }>;
};

export type PhenoCamProbeResult =
  | { ok: true; evidence: SourceCadenceEvidence }
  | { ok: false; sourceId: string; status: "fetch_failed"; detail: string };

export async function probePhenoCamSite(
  site: string,
  options: {
    fetchImpl?: typeof fetch;
    checkedAt?: string;
    staleBefore?: string;
  } = {}
): Promise<PhenoCamProbeResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const normalizedSite = site.trim().toLowerCase();
  const checkedAt = options.checkedAt ?? new Date().toISOString();
  const staleBefore = options.staleBefore ?? "2026-01-01";
  const sourceId = `phenocam:${normalizedSite}`;

  try {
    const [cameraResponse, imageHeaders, dailyCountsResponse] = await Promise.all([
      fetchImpl(`https://phenocam.nau.edu/api/cameras/${normalizedSite}/`),
      fetchImpl(`https://phenocam.nau.edu/data/latest/${normalizedSite}.jpg`, { method: "HEAD" }),
      fetchImpl(`https://phenocam.nau.edu/api/dailycounts/?site=${encodeURIComponent(normalizedSite)}&limit=5`)
    ]);

    if (!cameraResponse.ok || !imageHeaders.ok || !dailyCountsResponse.ok) {
      return {
        ok: false,
        sourceId,
        status: "fetch_failed",
        detail: `PhenoCam probe failed for ${normalizedSite}.`
      };
    }

    const camera = (await cameraResponse.json()) as PhenoCamCamera;
    const dailyCountsJson = (await dailyCountsResponse.json()) as PhenoCamDailyCountsResponse;
    const dailyCounts = (dailyCountsJson.results ?? []).map((item) => ({
      localDate: item.local_date ?? "unknown",
      rgbCount: item.rgb_count ?? 0,
      infraredCount: item.ir_count ?? 0
    }));
    const latestModified = imageHeaders.headers.get("Last-Modified") ?? undefined;
    const etag = imageHeaders.headers.get("ETag") ?? undefined;
    const byteSizeHeader = imageHeaders.headers.get("Content-Length");
    const byteSize = byteSizeHeader ? Number.parseInt(byteSizeHeader, 10) : undefined;
    const firstCount = dailyCounts[0];
    const freshnessObservation = buildFreshnessObservation({
      checkedAt,
      latestModified,
      rgbCount: firstCount?.rgbCount
    });
    const isCurrent = Boolean(camera.active) && Boolean(camera.date_last && camera.date_last >= staleBefore);
    const status = isCurrent ? "cadence_candidate" : "stale_snapshot";
    const sourceName = camera.Sitename ?? normalizedSite;
    const latestImageUrl = `https://phenocam.nau.edu/data/latest/${normalizedSite}.jpg`;
    const cadenceSummary = firstCount
      ? `${sourceName} reported ${firstCount.rgbCount} RGB frames and ${firstCount.infraredCount} infrared frames on ${firstCount.localDate}.`
      : `${sourceName} has no daily count rows in the latest probe.`;

    return {
      ok: true,
      evidence: sourceCadenceEvidenceSchema.parse({
        sourceId,
        sourceName,
        sourceType: "periodic_snapshot",
        status,
        checkedAt,
        latestImageUrl,
        sourcePageUrl: `https://phenocam.nau.edu/webcam/sites/${normalizedSite}/`,
        locationLabel: camera.sitemetadata?.site_description ?? sourceName,
        termsStatus: "permitted",
        licenseOrTermsRef: "PhenoCam fair-use policy; imagery and data are available under CC BY 4.0 with attribution.",
        apiDateLast: camera.date_last,
        latestModified,
        etag,
        byteSize: Number.isFinite(byteSize) ? byteSize : undefined,
        freshnessObservation: {
          ...freshnessObservation,
          includeForInference: isCurrent && freshnessObservation.includeForInference
        },
        dailyCounts,
        cadenceSummary,
        recommendedAction: status === "cadence_candidate" && freshnessObservation.includeForInference
          ? "Eligible for timed polling and changed-frame Groq extraction."
          : "Do not run Groq for speed claims until the source returns current cadence evidence."
      })
    };
  } catch (error) {
    return {
      ok: false,
      sourceId,
      status: "fetch_failed",
      detail: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function probePhenoCamSites(
  sites: string[],
  options: Parameters<typeof probePhenoCamSite>[1] = {}
) {
  const results = await Promise.all(sites.map((site) => probePhenoCamSite(site, options)));
  const cadenceCandidates = results.filter((result) => result.ok && result.evidence.status === "cadence_candidate").length;
  const okResults = results.filter((result) => result.ok);
  const freshnessCounts = okResults.reduce(
    (counts, result) => {
      const status = result.evidence.freshnessObservation.status;
      if (status === "stale") counts.staleFreshness += 1;
      else if (status === "unknown") counts.unknownFreshness += 1;
      else counts[status] += 1;
      if (result.evidence.freshnessObservation.includeForInference) counts.inferenceEligible += 1;
      return counts;
    },
    {
      fresh: 0,
      recent: 0,
      staleFreshness: 0,
      unknownFreshness: 0,
      inferenceEligible: 0
    }
  );

  return {
    results,
    summary: {
      totalSources: results.length,
      cadenceCandidates,
      inferenceEligible: freshnessCounts.inferenceEligible,
      fresh: freshnessCounts.fresh,
      recent: freshnessCounts.recent,
      staleFreshness: freshnessCounts.staleFreshness,
      unknownFreshness: freshnessCounts.unknownFreshness,
      staleSnapshots: results.filter((result) => result.ok && result.evidence.status === "stale_snapshot").length,
      failed: results.filter((result) => !result.ok).length
    }
  };
}

export function buildPhenoCamSourceEvent(evidence: SourceCadenceEvidence, capturedAt = new Date().toISOString()): SourceEvent {
  return sourceEventSchema.parse({
    sourceId: evidence.sourceId,
    sourceName: evidence.sourceName,
    sourceType: evidence.sourceType,
    capturedAt,
    imageUrl: evidence.latestImageUrl,
    locationLabel: evidence.locationLabel,
    sourcePageUrl: evidence.sourcePageUrl,
    licenseOrTermsRef: evidence.licenseOrTermsRef,
    termsStatus: evidence.termsStatus,
    freshnessObservation: evidence.freshnessObservation,
    notes: `${evidence.freshnessObservation.summary}. ${evidence.cadenceSummary} ${evidence.recommendedAction}`
  });
}

function buildFreshnessObservation(input: {
  checkedAt: string;
  latestModified?: string;
  rgbCount?: number;
}): SourceFreshnessObservation {
  const checkedDate = new Date(input.checkedAt);
  const sourceDate = input.latestModified ? new Date(input.latestModified) : undefined;
  const sourceReportedAt = sourceDate && Number.isFinite(sourceDate.getTime()) ? sourceDate.toISOString() : undefined;
  const ageMs = sourceDate && Number.isFinite(sourceDate.getTime())
    ? Math.max(0, checkedDate.getTime() - sourceDate.getTime())
    : undefined;
  const expectedFramesPerDay = input.rgbCount && input.rgbCount > 0 ? input.rgbCount : undefined;
  const expectedCadenceSeconds = expectedFramesPerDay ? Math.round(86_400 / expectedFramesPerDay) : undefined;
  const status = classifyFreshness(ageMs, expectedCadenceSeconds);
  const includeForInference = status === "fresh" || status === "recent";
  const basis = sourceReportedAt ? "last_modified" : expectedFramesPerDay ? "daily_counts" : "none";
  const ageLabel = ageMs === undefined ? "unknown age" : formatAge(ageMs);
  const expectedLabel = expectedFramesPerDay
    ? `expected ~${expectedFramesPerDay} RGB frames/day`
    : "expected cadence unknown";

  return {
    checkedAt: checkedDate.toISOString(),
    sourceReportedAt,
    ageMs,
    ageLabel,
    status,
    basis,
    expectedCadenceSeconds,
    expectedFramesPerDay,
    includeForInference,
    summary: `${capitalize(status)}: checked ${formatDisplayTime(checkedDate)}, source image ${ageLabel}, ${expectedLabel}`
  };
}

function classifyFreshness(ageMs: number | undefined, expectedCadenceSeconds: number | undefined): SourceFreshnessObservation["status"] {
  if (ageMs === undefined || expectedCadenceSeconds === undefined) return "unknown";
  const expectedCadenceMs = expectedCadenceSeconds * 1000;
  if (ageMs <= expectedCadenceMs * 2) return "fresh";
  if (ageMs <= expectedCadenceMs * 6) return "recent";
  return "stale";
}

function formatAge(ageMs: number): string {
  const minutes = Math.round(ageMs / 60_000);
  if (minutes < 60) return `${minutes} min old`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hr old`;
  const days = Math.round(hours / 24);
  return `${days} days old`;
}

function formatDisplayTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: process.env.CSG_DISPLAY_TIME_ZONE ?? "America/Detroit",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
