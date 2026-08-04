import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

const jdk21 = path.join(root, ".tools", "jdk-21");
const jdk17 = path.join(root, ".tools", "jdk-17");
const sdk = path.join(root, ".tools", "android-sdk");

const javaHome = [jdk21, jdk17].find((dir) =>
  existsSync(path.join(dir, "bin", isWin ? "java.exe" : "java")),
);

if (!javaHome) {
  console.error(
    "No portable JDK found. Expected .tools/jdk-21 (preferred) or .tools/jdk-17.",
  );
  process.exit(1);
}

if (!existsSync(path.join(sdk, "platforms", "android-36"))) {
  console.error(
    "Android SDK incomplete. Expected platforms;android-36 under .tools/android-sdk.",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: sdk,
  ANDROID_SDK_ROOT: sdk,
  PATH: [
    path.join(javaHome, "bin"),
    path.join(sdk, "platform-tools"),
    process.env.PATH ?? "",
  ].join(path.delimiter),
};

const localProps = path.join(root, "android", "local.properties");
mkdirSync(path.dirname(localProps), { recursive: true });
writeFileSync(localProps, `sdk.dir=${sdk.replace(/\\/g, "/")}\n`, "utf8");

const gradlew = path.join(root, "android", isWin ? "gradlew.bat" : "gradlew");
const result = spawnSync(gradlew, ["assembleDebug", "--no-daemon"], {
  cwd: path.join(root, "android"),
  env,
  stdio: "inherit",
  shell: isWin,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const builtApk = path.join(
  root,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);
const outDir = path.join(root, "public", "downloads");
const outApk = path.join(outDir, "mpesa.apk");

if (!existsSync(builtApk)) {
  console.error(`APK not found at ${builtApk}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(builtApk, outApk);

const mb = (statSync(outApk).size / (1024 * 1024)).toFixed(2);
console.log(`APK ready: ${outApk} (${mb} MB)`);
console.log("Download URL path: /downloads/mpesa.apk");
