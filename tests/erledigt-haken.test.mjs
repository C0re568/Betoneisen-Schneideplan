/* Regressionstest für die Erledigt-Haken im Schneideplan.
   Prüft die Zusage „ein Haken je Plan-Eintrag, Fortschritt zählt trotzdem in Stangen"
   in einem echten Browser gegen die Beispieldaten des Werkzeugs.

   Aufruf: npm test   (im Ordner tests/) */

import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const HTML = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "..", "schneideplan.html")).href;

let pass = 0, fail = 0;
const ok = (cond, text) => { cond ? pass++ : fail++; console.log(`  ${cond ? "ok  " : "FEHL"}  ${text}`); };
const head = t => console.log(`\n${t}`);

const browser = await chromium.launch({
  // erlaubt, den Browser aus einer abweichenden Installation zu ziehen
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
});
const page = await browser.newPage();
const jsErrors = [];
page.on("pageerror", e => jsErrors.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error") jsErrors.push("console: " + m.text()); });
page.on("dialog", d => d.accept());

await page.goto(HTML);

/* „Schneideplan berechnen" rechnet verzögert (setTimeout). Ohne Marker würde ein
   waitForSelector sofort auf den Bars der vorherigen Rechnung anschlagen. */
async function berechnen() {
  await page.evaluate(() => {
    const m = document.createElement("div"); m.id = "__stale";
    document.getElementById("out").appendChild(m);
  });
  await page.click("#btnCalc");
  await page.waitForFunction(() => !document.getElementById("__stale"));
  await page.waitForSelector("#out .bar");
}

const fortschritt = async () => (await page.textContent("#progAll .v")).trim();
const gesetzt = i => page.$eval(`[data-donegrp="${i}"]`, c => c.checked);

await berechnen();

head("Aufbau: genau ein Haken je Eintrag");
const einträge = await page.$$eval("#out .bar", bs => bs.map(b => b.querySelectorAll("[data-donegrp]").length));
ok(einträge.length > 0 && einträge.every(n => n === 1), `${einträge.length} Einträge, jeder mit genau 1 Kästchen`);
ok((await page.$$("#out [data-alldone]")).length === 0, "kein 'alle'-Schalter mehr vorhanden");

head("Gruppen decken jede Stange genau einmal ab");
const gruppen = await page.evaluate(() => tickGroups);
const stangen = gruppen.reduce((a, g) => a + g.length, 0);
const schlüssel = gruppen.flat();
ok(new Set(schlüssel).size === schlüssel.length, `${stangen} Stangen, alle Schlüssel eindeutig`);
ok(gruppen.length === einträge.length, `tickGroups (${gruppen.length}) deckt sich mit den Einträgen`);
const größte = gruppen.reduce((a, g, i) => g.length > gruppen[a].length ? i : a, 0);
const nGrößte = gruppen[größte].length;
ok(nGrößte > 1, `Beispieldaten enthalten eine Gruppe mit ${nGrößte} Stangen (sonst prüft der Test nichts)`);

head("Ein Haken hakt die ganze Gruppe ab, gezählt wird in Stangen");
ok(await fortschritt() === `0 / ${stangen}`, `Start bei 0 / ${stangen}`);
await page.check(`[data-donegrp="${größte}"]`);
ok(await fortschritt() === `${nGrößte} / ${stangen}`, `ein Klick ergibt ${nGrößte} / ${stangen}`);
ok(await page.evaluate(() => Object.keys(state.done).length) === nGrößte, `${nGrößte} Stangen-Schlüssel gespeichert`);
ok(await page.$eval(`[data-donegrp="${größte}"]`, c => c.closest(".bar").classList.contains("alldone")), "Eintrag wird als erledigt dargestellt");

await page.uncheck(`[data-donegrp="${größte}"]`);
ok(await fortschritt() === `0 / ${stangen}`, "Abwählen nimmt alle Stangen der Gruppe zurück");
ok(await page.evaluate(() => Object.keys(state.done).length) === 0, "keine Schlüssel mehr gespeichert");

head("Fortschritt je Durchmesser summiert sich auf die Gesamtzahl");
await page.check(`[data-donegrp="${größte}"]`);
const panels = (await page.$$eval("#out [data-prog]", els => els.map(e => e.textContent.trim())))
  .map(t => (t.match(/(\d+) \/ (\d+)/) || []).slice(1).map(Number)).filter(a => a.length);
ok(panels.reduce((a, x) => a + x[1], 0) === stangen, "Summe der Nenner entspricht allen Stangen");
ok(panels.reduce((a, x) => a + x[0], 0) === nGrößte, "Summe der Zähler entspricht den abgehakten Stangen");

head("Umschalten der Gruppierung verwirft keine Haken");
const vorher = await page.evaluate(() => Object.keys(state.done).sort());
await page.uncheck("#groupSame");
await berechnen();
ok(JSON.stringify(await page.evaluate(() => Object.keys(state.done).sort())) === JSON.stringify(vorher), "gespeicherte Schlüssel unverändert");
ok(await page.$$eval("#out [data-donegrp]", cs => cs.length) === stangen, `ungruppiert werden ${stangen} Einzeleinträge gezeigt`);
ok(await page.$$eval("#out [data-donegrp]", cs => cs.filter(c => c.checked).length) === nGrößte, `davon ${nGrößte} abgehakt`);
await page.check("#groupSame");
await berechnen();
ok(await fortschritt() === `${nGrößte} / ${stangen}`, "zurück gruppiert bleibt der Fortschritt erhalten");
ok(await gesetzt(größte), "der Gruppen-Haken ist wieder gesetzt");

head("Teilweise abgehakte Gruppe (importierte Altdaten)");
await page.evaluate(() => {
  const g = tickGroups.find(x => x.length > 1);
  state.done = { [g[0]]: true };
  refreshTicks();
});
ok(await page.$$eval("#out [data-donegrp]", cs => cs.filter(c => c.indeterminate).length) === 1, "genau ein Kästchen steht auf teilweise");
ok(await page.$$eval("#out [data-donegrp]", cs => cs.filter(c => c.checked).length) === 0, "kein Kästchen gilt als vollständig");
ok(await fortschritt() === `1 / ${stangen}`, `Fortschritt zeigt 1 / ${stangen}`);
const teil = await page.$eval("#out [data-donegrp]:indeterminate", c => c.dataset.donegrp);
await page.click(`[data-donegrp="${teil}"]`);
const nTeil = await page.evaluate(i => tickGroups[i].length, +teil);
ok(await fortschritt() === `${nTeil} / ${stangen}`, "ein Klick darauf hakt die restlichen Stangen mit ab");

head("Haken zurücksetzen");
await page.click("#btnResetDone");
await page.waitForFunction(() => Object.keys(state.done).length === 0);
ok(await fortschritt() === `0 / ${stangen}`, "Fortschritt steht wieder auf 0");
ok(await page.$$eval("#out [data-donegrp]", cs => cs.every(c => !c.checked && !c.indeterminate)), "alle Kästchen sind sichtbar leer");
ok(await page.$$eval("#out .bar", bs => bs.every(b => !b.classList.contains("alldone"))), "keine Stange ist mehr durchgestrichen");

head("Haken überleben einen Reload");
await page.check(`[data-donegrp="${größte}"]`);
await page.waitForTimeout(400);   // save() schreibt verzögert (250 ms)
await page.reload();
await berechnen();
ok(await fortschritt() === `${nGrößte} / ${stangen}`, `nach dem Neuladen wieder ${nGrößte} / ${stangen}`);
ok(await gesetzt(größte), "der Haken sitzt wieder am selben Eintrag");

head("Haken verfallen, wenn sich das Schnittmuster ändert");
await page.fill("#stockDefault", "6");
await berechnen();
const neu = await page.evaluate(() => tickGroups.reduce((a, g) => a + g.length, 0));
ok(neu !== stangen, `andere Stangenlänge ergibt eine andere Stangenzahl (${stangen} -> ${neu})`);
ok(await fortschritt() === `0 / ${neu}`, "die Haken der alten Schnittmuster gelten nicht weiter");

head("Keine Ausgabe vorhanden");
await page.evaluate(() => { document.getElementById("out").innerHTML = ""; tickGroups = []; refreshTicks(); });
ok(true, "refreshTicks() ohne gerenderten Plan läuft durch");

head("Browser-Konsole");
ok(jsErrors.length === 0, jsErrors.length ? "JavaScript-Fehler: " + jsErrors.join(" | ") : "keine JavaScript-Fehler");

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen\n`);
await browser.close();
process.exit(fail ? 1 : 0);
