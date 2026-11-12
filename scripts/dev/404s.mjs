import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage();
p.on("response", (r) => r.status() >= 400 && console.log(r.status(), r.url()));
await p.goto(process.argv[2], { waitUntil: "load" }); await p.waitForTimeout(3000); await b.close();
