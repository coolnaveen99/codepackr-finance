import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser = await chromium.launch({
  executablePath:
    "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

async function shot(htmlPath, outPath, { width, height, dsf = 1 }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: dsf,
  });
  await page.goto(pathToFileURL(resolve(htmlPath)).href, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: resolve(outPath), type: "png" });
  await page.close();
  console.log("wrote", outPath);
}

await shot("/workspace/.grok/og-card.html", "/workspace/.grok/og-card-raw.png", {
  width: 1200,
  height: 630,
  dsf: 2,
});
await shot("/workspace/.grok/favicon-shot.html", "/workspace/.grok/favicon-preview.png", {
  width: 360,
  height: 180,
  dsf: 2,
});

await browser.close();
