/* Regressionstest für die Spalte „erledigt" in der Stückliste.
   Prüft die Zusage „was im Schneideplan abgehakt ist, ist in der Stückliste je Position
   als erledigt bzw. offen ablesbar" in einem echten Browser gegen die Beispieldaten.

   Aufruf: npm test   (im Ordner tests/) */

import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const HTML = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "..", "schneideplan.html")).href;

let pass = 0, fail = 0;
const ok = (cond, text) => { cond ? pass++ : fail++; console.log(`  ${cond ? "ok  " : "FEHL"}  ${text}`); };
const head = t => console.log(`\n${t}`);

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
});
const page = await browser.newPage();
const jsErrors = [];
page.on("pageerror", e => jsErrors.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error") jsErrors.push("console: " + m.text()); });
page.on("dialog", d => d.accept());

await page.goto(HTML);
// unabhängig von einem eventuell im Browser-Speicher liegenden Stand starten
await page.click("#btnDemo");

async function berechnen() {
  await page.evaluate(() => {
    const m = document.createElement("div"); m.id = "__stale";
    document.getElementById("out").appendChild(m);
  });
  await page.click("#btnCalc");
  await page.waitForFunction(() => !document.getElementById("__stale"));
  await page.waitForSelector("#out .bar");
}

/* Die Spalte je Zeile: Zustand, Zähler, Nenner. */
const zellen = () => page.$$eval("#lists [data-doneof]", tds => tds.map(td => {
  const m = td.textContent.match(/(\d+)\s*\/\s*(\d+)/);
  return {
    key: td.dataset.doneof, st: td.dataset.donestate,
    done: m ? +m[1] : null, n: m ? +m[2] : null,
    text: td.textContent.replace(/\s+/g, " ").trim(),
    durchgestrichen: td.closest("tr").classList.contains("posdone")
  };
}));
const summe = (zs, f) => zs.reduce((a, z) => a + (z[f] || 0), 0);

head("Vor der Berechnung");
let zs = await zellen();
ok(zs.length === 5, `${zs.length} Zeilen der Beispieldaten haben eine Spalte „erledigt"`);
ok(zs.every(z => z.st === "none"), "ohne gerechneten Plan steht überall der neutrale Strich");
ok(await page.$eval("#lists th[title]", th => th.textContent.trim()) === "erledigt", "Spaltenkopf heißt „erledigt\"");

head("Nach der Berechnung: alles offen");
await berechnen();
zs = await zellen();
const gesamtStücke = await page.evaluate(() =>
  lastResult.results.reduce((a, R) => a + R.cut.reduce((s, it) => s + it.qty, 0), 0));
ok(zs.every(z => z.st === "open"), "jede Position steht auf offen");
ok(zs.every(z => z.done === 0), "kein Stück gilt als geschnitten");
ok(summe(zs, "n") === gesamtStücke, `Nenner summieren sich auf ${gesamtStücke} Stück des Plans`);
ok(zs.every(z => z.text.includes("offen")), "je Zeile steht daneben, wie viele Stück offen sind");
ok(!zs.some(z => z.durchgestrichen), "keine Zeile ist durchgestrichen");

head("Ein Haken im Schneideplan schlägt in der Stückliste durch");
const gruppen = await page.evaluate(() => tickGroups);
const größte = gruppen.reduce((a, g, i) => g.length > gruppen[a].length ? i : a, 0);
// Erwartung aus dem Plan: welche Position bekommt durch diesen Haken wie viele Stück?
const erwartet = await page.evaluate(i => {
  const keys = new Set(tickGroups[i]), acc = {};
  lastResult.results.forEach(R => R.bars.forEach(b => {
    if (!keys.has(`${b.id}|${b.cap}|${b.pieces.map(p => p.it.label + ":" + p.len).join(",")}`)) return;
    b.pieces.forEach(p => { acc[p.it.key] = (acc[p.it.key] || 0) + 1; });
  }));
  return acc;
}, größte);
await page.check(`[data-donegrp="${größte}"]`);
zs = await zellen();
const anzahlErwartet = Object.values(erwartet).reduce((a, x) => a + x, 0);
ok(anzahlErwartet > 0, `der Haken deckt ${anzahlErwartet} Stück ab`);
ok(zs.every(z => z.done === (erwartet[z.key] || 0)),
  `je Position genau die geschnittenen Stück: ${zs.map(z => z.key + "=" + z.done).join(", ")}`);
ok(summe(zs, "done") === anzahlErwartet, "Summe der Zähler entspricht den Stücken der abgehakten Stangen");

await page.uncheck(`[data-donegrp="${größte}"]`);
ok(summe(await zellen(), "done") === 0, "Abwählen setzt den Fortschritt der Positionen zurück");

head("Vollständig abgehakt");
await page.$$eval("#out [data-donegrp]", cs => cs.forEach(c => { if (!c.checked) c.click(); }));
zs = await zellen();
ok(zs.every(z => z.st === "all"), "jede Position ist fertig");
ok(zs.every(z => z.done === z.n), "Zähler und Nenner stimmen überein");
ok(zs.every(z => z.durchgestrichen), "fertige Zeilen werden durchgestrichen");
ok(zs.every(z => z.text.includes("fertig")), "und als „fertig\" beschriftet");

head("Haken zurücksetzen");
await page.click("#btnResetDone");
await page.waitForFunction(() => Object.keys(state.done).length === 0);
zs = await zellen();
ok(zs.every(z => z.st === "open" && z.done === 0), "alle Positionen stehen wieder offen");
ok(!zs.some(z => z.durchgestrichen), "keine Zeile mehr durchgestrichen");

head("Geänderte Zeile: der Fortschritt gilt nicht weiter");
await page.check(`[data-donegrp="${größte}"]`);
const geändert = Object.keys(erwartet)[0];
const [li, ri] = geändert.split(":");
await page.fill(`[data-li="${li}"] [data-ri="${ri}"] [data-f="qty"]`, "99");
zs = await zellen();
ok(zs.find(z => z.key === geändert).st === "stale", "die geänderte Zeile verlangt eine Neuberechnung");
ok(zs.filter(z => z.key !== geändert).every(z => z.st !== "stale"), "die übrigen Zeilen bleiben unberührt");
await berechnen();
ok((await zellen()).every(z => z.st !== "stale"), "nach dem Neurechnen ist der Hinweis weg");

head("Fixlänge wird nicht geschnitten");
await page.check(`[data-li="0"] [data-ri="0"] [data-f="fix"]`);
await berechnen();
zs = await zellen();
ok(zs.find(z => z.key === "0:0").st === "nocut", "die Fixlängen-Position steht als „nicht im Plan\"");
ok(zs.filter(z => z.key !== "0:0").every(z => z.st === "open" || z.st === "all"), "die geschnittenen Positionen zählen weiter");
await page.uncheck(`[data-li="0"] [data-ri="0"] [data-f="fix"]`);
await berechnen();

head("Sprachwechsel");
await page.click(`#langsw button[data-lang="en"]`);
ok(await page.$eval("#lists th[title]", th => th.textContent.trim()) === "done", "Spaltenkopf auf Englisch");
await page.check(`[data-donegrp="${größte}"]`);
ok((await zellen()).some(z => z.text.includes("open")), "die Beschriftung „open\" kommt mit");
await page.click(`#langsw button[data-lang="de"]`);
ok((await zellen()).some(z => z.text.includes("offen")), "und wieder zurück auf „offen\"");

head("Ohne gerechneten Plan");
await page.click("#btnClear");
zs = await zellen();
ok(zs.length === 1 && zs[0].st === "none", "nach „Alles leeren\" steht die Spalte wieder neutral");

head("Browser-Konsole");
ok(jsErrors.length === 0, jsErrors.length ? "JavaScript-Fehler: " + jsErrors.join(" | ") : "keine JavaScript-Fehler");

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen\n`);
await browser.close();
process.exit(fail ? 1 : 0);
