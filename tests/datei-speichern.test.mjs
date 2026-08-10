/* Regressionstest für „Als Datei speichern".

   Der Knopf hat zwei Zusagen, die leicht unbemerkt kaputtgehen:
   er erscheint nur online (lokal hat man die Datei ja schon), und er liefert
   das unveränderte Original aus — nicht das laufende DOM mit den bereits
   eingetippten Daten darin.

   Aufruf: npm test   (im Ordner tests/) */

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const DATEI = join(dirname(fileURLToPath(import.meta.url)), "..", "schneideplan.html");
const ORIGINAL = await readFile(DATEI, "utf8");

let pass = 0, fail = 0;
const ok = (cond, text) => { cond ? pass++ : fail++; console.log(`  ${cond ? "ok  " : "FEHL"}  ${text}`); };
const head = t => console.log(`\n${t}`);

/* Die ausgelieferte Seite liegt online unter index.html — genau wie beim
   Pages-Deploy, damit der Test denselben Fall trifft wie die echte Seite. */
const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(ORIGINAL);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const ORT = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
});
const page = await browser.newPage({ acceptDownloads: true });
const jsErrors = [];
page.on("pageerror", e => jsErrors.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error") jsErrors.push("console: " + m.text()); });

head("Lokal geöffnete Datei zeigt den Knopf nicht");
await page.goto(pathToFileURL(DATEI).href);
ok(await page.locator("#btnSaveApp").isHidden(), "unter file:// bleibt der Knopf verborgen");

head("Online erscheint der Knopf");
await page.goto(ORT);
ok(await page.locator("#btnSaveApp").isVisible(), "unter http:// ist der Knopf sichtbar");
ok((await page.locator("#btnSaveApp").textContent()).trim() === "Als Datei speichern",
  "deutsche Beschriftung sitzt");
ok((await page.locator("#btnSaveApp").getAttribute("title") || "").includes("ohne Internet"),
  "Kurzhilfe als title-Attribut vorhanden");

head("Beschriftung wechselt mit der Sprache");
await page.click('#langsw button[data-lang="en"]');
ok((await page.locator("#btnSaveApp").textContent()).trim() === "Save as file",
  "englische Beschriftung nach dem Umschalten");
await page.click('#langsw button[data-lang="de"]');

head("Gespeichert wird das unveränderte Original");
/* Erst Daten eintippen und rechnen lassen: das DOM weicht danach deutlich vom
   Original ab. Genau dieser Zustand darf nicht in der Datei landen. */
await page.click("#btnDemo");
await page.click("#btnCalc");
await page.waitForSelector("#out .bar");
await page.fill("#stockDefault", "5.5");

const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.click("#btnSaveApp")
]);
ok(download.suggestedFilename() === "schneideplan.html", "Dateiname ist schneideplan.html");

/* Mit Endung ablegen: ohne .html behandelt der Browser die Datei beim
   späteren Öffnen als reinen Text statt als Seite. */
const pfad = join(await mkdtemp(join(tmpdir(), "schneideplan-")), "schneideplan.html");
await download.saveAs(pfad);
const gespeichert = await readFile(pfad, "utf8");
ok(gespeichert === ORIGINAL, "Inhalt stimmt Byte für Byte mit der Quelldatei überein");
ok(!gespeichert.includes('value="5.5"'), "die eingetippte Lagerlänge ist nicht mitgespeichert");
ok(gespeichert.startsWith("<!doctype html>"), "die gespeicherte Datei beginnt mit der Doctype-Zeile");

head("Die gespeicherte Datei ist für sich lauffähig");
const zweite = await browser.newPage();
const fehlerZweite = [];
zweite.on("pageerror", e => fehlerZweite.push(e.message));
await zweite.goto(pathToFileURL(pfad).href);
await zweite.click("#btnDemo");
await zweite.click("#btnCalc");
await zweite.waitForSelector("#out .bar");
ok((await zweite.locator("#out .bar").count()) > 0, "sie rechnet lokal einen Plan");
ok(fehlerZweite.length === 0, "dabei keine JavaScript-Fehler");
await zweite.close();

head("Browser-Konsole");
ok(jsErrors.length === 0, "keine JavaScript-Fehler" + (jsErrors.length ? ": " + jsErrors.join(" | ") : ""));

await browser.close();
server.close();

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
