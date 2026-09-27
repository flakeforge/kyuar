/**
 * Runs from the document head, before any bundle loads, so phones expand and
 * go fullscreen as soon as the Mini App opens instead of after hydration. It
 * talks to the Telegram webview proxy directly, the same way the SDK does, and
 * does nothing on desktop, web and outside Telegram.
 */
export const TELEGRAM_BOOT_SCRIPT = `(() => {
  try {
    const proxy = window.TelegramWebviewProxy;
    if (!proxy) return;
    const params = new URLSearchParams(location.hash.slice(1));
    const platform = params.get("tgWebAppPlatform");
    if (platform !== "ios" && platform !== "android" && platform !== "android_x") return;
    proxy.postEvent("web_app_expand");
    const major = Number((params.get("tgWebAppVersion") || "0").split(".")[0]);
    if (major >= 8) proxy.postEvent("web_app_request_fullscreen");
  } catch {}
})();`;
