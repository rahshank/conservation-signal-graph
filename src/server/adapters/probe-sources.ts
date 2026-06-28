import { probeNpsWebcamSource } from "./nps-webcam";
import { probePhenoCamSites } from "./phenocam";

const phenocamSites = (process.env.PHENOCAM_SITES ?? "aguamarga,barrocolorado,alercecosteroforest")
  .split(",")
  .map((site) => site.trim())
  .filter(Boolean);

const [nps, phenocam] = await Promise.all([
  probeNpsWebcamSource(),
  probePhenoCamSites(phenocamSites)
]);

console.log(JSON.stringify({
  nps,
  phenocam
}, null, 2));

if (phenocam.summary.cadenceCandidates === 0 && !nps.ok) {
  process.exitCode = nps.status === "missing_key" ? 0 : 1;
}
