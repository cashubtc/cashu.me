import { App, ComponentPublicInstance } from "vue";
import { bugstr, captureException, initBugstr } from "./pocBugstr";

type PluginConfig = {
  developerPubkey: string;
  relays?: string[];
  environment?: string;
  release?: string;
};

export function installBugstrPlugin(app: App, config: PluginConfig) {
  if (!config.developerPubkey) {
    console.warn("Bugstr disabled: developer pubkey missing");
    return;
  }

  initBugstr({
    ...config,
  });

  const previousHandler = app.config.errorHandler;
  app.config.errorHandler = (
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ) => {
    captureException(err);
    if (previousHandler) {
      previousHandler(err, instance, info);
    }
  };

  app.config.globalProperties.$bugstr = bugstr;
}

export { captureException, initBugstr } from "./pocBugstr";
