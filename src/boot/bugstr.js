import { boot } from "quasar/wrappers";
import { installBugstrPlugin } from "src/bugstr/plugin";

export default boot(({ app }) => {
  const relays =
    (process.env.BUGSTR_RELAYS || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) || [];

  installBugstrPlugin(app, {
    developerPubkey: process.env.BUGSTR_NPUB || "",
    relays,
    environment: process.env.NODE_ENV || "development",
    release: typeof GIT_COMMIT !== "undefined" ? GIT_COMMIT : "dev",
  });
});
