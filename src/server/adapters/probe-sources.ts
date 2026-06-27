import { probeNpsWebcamSource } from "./nps-webcam";

const result = await probeNpsWebcamSource();
console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = result.status === "missing_key" ? 0 : 1;
}
