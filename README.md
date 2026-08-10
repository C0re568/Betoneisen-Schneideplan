# Schneideplan Betoneisen · Rebar Cutting Plan

## ▶ [Werkzeug öffnen / open the tool](https://c0re568.github.io/Betoneisen-Schneideplan/)

<https://c0re568.github.io/Betoneisen-Schneideplan/> — direkt im Browser, nichts zu installieren /
straight in the browser, nothing to install.

**[Deutsch](#deutsch) · [English](#english)**

**Datei / file:** [`schneideplan.html`](schneideplan.html) — eine einzige HTML-Datei ohne Abhängigkeiten /
a single HTML file with no dependencies. Für die Arbeit ohne Internet legt der Knopf
**Als Datei speichern** auf der Seite sie ab / the **Save as file** button on the page stores it
for working offline.

---

## Deutsch

Werkzeug zur verschnittoptimierten Aufteilung von Betonstahl-Stabpositionen auf Lagerstangen
(eindimensionales Zuschnittproblem / cutting stock).

Im Browser öffnen (Doppelklick), es wird nichts installiert und nichts hochgeladen.

### Sprache

Ganz oben rechts lässt sich zwischen **Deutsch** und **English** umschalten. Die Wahl wird im
Browser gespeichert und beim nächsten Öffnen wieder verwendet; Standard ist Deutsch. Umgeschaltet
wird die gesamte Oberfläche inklusive eines bereits berechneten Schneideplans — die Eingaben, die
gesetzten Haken und das Ergebnis bleiben dabei erhalten, es wird nicht neu gerechnet. Auch die
Zahlenformate wechseln mit (`7,00 m` bzw. `7.00 m`). Selbst eingetragene Bezeichnungen von
Stücklisten und Positionen bleiben unverändert stehen — nur die Beispieldaten kommen beim Laden
in der jeweils aktiven Sprache.

### Was es macht

* Verarbeitet **mehrere Stücklisten** gleichzeitig (z. B. Stoßüberdeckung, Obere Bewehrung, Unterzüge).
* Rechnet **je Durchmesser getrennt**, Lagerlänge global oder je ø einstellbar (Standard 7,00 m).
* Berücksichtigt optional **vorhandene Reststangen** aus dem Lager (siehe unten).
* **Schnittbreite wird ignoriert** (wie gefordert).
* Gibt einen Schneideplan aus, bei dem **jedes geschnittene Stück seiner Position zugeordnet bleibt**:
  * Schnittmuster-Übersicht (was wird wie oft geschnitten),
  * Plan Stange für Stange mit Positions-Kennzeichnung je Stück (identische Stangen zusammengefasst),
  * Rückwärts-Zuordnung „Position → aus welchen Stangen geschnitten".
* **Erledigt-Haken je Plan-Eintrag** zum Abhaken während des Schneidens, mit Fortschrittsanzeige
  in Stangen.
* Listet **verwertbare Reststücke** ab einer einstellbaren Mindestlänge.
* **Zusatzauswertung:** welche Position den meisten Verschnitt verursacht und daher besser
  in Fixlängen ab Werk bestellt wird.

### Positions-Kennzeichnung

Jede Stückliste bekommt einen Buchstaben (A, B, C …), jedes Stück das Etikett `A·4`
(= Stückliste A, Position 4). Kommt eine Positionsnummer mehrfach mit verschiedenen Längen vor,
wird sie automatisch unterschieden (`C·UZ6a`, `C·UZ6b`).

### Reststangen

Unter „Vorhandene Reststangen" lassen sich verwertbare Reste aus früheren Schnitten mit
ø, Länge und Stückzahl erfassen. Sie werden als zusätzliche Stangen mit eigener Länge in die
Optimierung aufgenommen — mit einer bewussten Einschränkung:

> Eine Reststange wird **nur angebrochen, wenn dadurch eine neue Stange eingespart wird.**

Sonst würde Lagermaterial verbraucht, ohne dass sich an der Bestellmenge etwas ändert — der
Rest wandert nur von einem Stapel auf den anderen. Rangfolge der Optimierung: (1) möglichst
wenige neue Stangen, (2) möglichst wenige angebrochene Reststangen, (3) möglichst wenig
verbrauchtes Restmaterial. Die Ausgabe weist je Durchmesser aus, welche Reststangen
angebrochen wurden, welche unberührt bleiben und was nach dem Schnitt wieder als Rest anfällt.
Reststangen erscheinen im Plan als `R12-01` (maßstäblich kürzer gezeichnet), neue Stangen als `S12-001`.

### Erledigt-Haken

Jeder Eintrag im Schneideplan hat genau ein Kästchen zum Abhaken. Fasst die Ausgabe
identische Stangen zusammen, hakt dieses eine Kästchen alle Stangen des Schnittmusters
gemeinsam ab („gilt für alle 12 Stangen dieses Musters"); abgehakte Einträge werden
durchgestrichen und ausgegraut. Gezählt wird trotzdem in Stangen, nicht in Einträgen:
der Fortschritt je Durchmesser und gesamt zeigt „34 / 176 Stangen geschnitten".
**Haken zurücksetzen** löscht alle Haken nach Rückfrage.

Gespeichert wird an zwei Stellen:

* **Export/Import JSON** — die Haken sind im Feld `done` enthalten und werden beim Import
  wieder übernommen (mit Meldung, wie viele es waren). Das ist der zuverlässige Weg, um den
  Stand zu sichern oder an ein anderes Gerät zu übergeben.
* **Browser-Speicher** — Eingaben, Haken und die Sprachwahl werden automatisch zwischengespeichert
  und beim nächsten Öffnen auf demselben Gerät wiederhergestellt (mit Hinweis oben auf der Seite).
  Manche Browser sperren das bei lokalen Dateien; dann greift lautlos nur der Export.

Ein Haken hängt am Stangennamen **und am Inhalt der Stange**. Ändert sich nach einer
Neuberechnung das Schnittmuster einer Stange, verfällt ihr Haken, statt auf einem inhaltlich
anderen Schnitt stehen zu bleiben — im Zweifel lieber „noch offen" als fälschlich „erledigt".
Unveränderte Stangen behalten ihren Haken. Im Test blieben nach einer Mengenänderung
37 von 66 Haken erhalten, die 29 geänderten Stangen wurden zurückgesetzt.

### Verschnitt-Analyse

Zwei Kennzahlen je Position:

* **Grenz-Verschnitt** — Mehrverschnitt, den die Position im Gesamtplan verursacht
  (Plan mit der Position minus Plan ohne sie). Nur dieser Anteil lässt sich durch eine
  Fixlängen-Bestellung tatsächlich einsparen. Negativ = die Position füllt Reste anderer
  Positionen auf und senkt den Gesamtverschnitt.
* **Alleine geschnitten** — Verschnitt, wenn die Position ohne Kombination mit anderen
  Längen aus der Lagerstange geschnitten würde.

Als Fixlänge empfohlen wird erst, was mindestens eine ganze Lagerstange an Verschnitt
verursacht. Mit dem Häkchen **fix** lässt sich das direkt gegenrechnen: die Position fällt
aus dem Schneideplan und der Plan wird neu optimiert.

### Rechenverfahren

Musterbasierte Heuristik: für jede Stange wird per Branch & Bound das am besten füllende
Schnittmuster für den Restbedarf gesucht und maximal oft wiederholt; zusätzlich laufen
Best-Fit-Decreasing und randomisierte Mehrfachstarts. Reststangen werden vorab in
aufsteigender und absteigender Reihenfolge belegt, die bessere Variante gewinnt.
Bewertet wird primär die Stangenanzahl,
sekundär ein möglichst großes (und damit verwertbares) Reststück. Angezeigt wird auch die
rechnerische Untergrenze (Gesamtlänge ÷ Lagerlänge) als Vergleichsmaßstab — diese ist je nach
Längenkombination nicht immer erreichbar.

### Bedienung

* **Beispieldaten laden** — ein bewusst kleines Beispiel zum Überschreiben: zwei Stücklisten
  („Platte" mit 3 Positionen, „Unterzug" mit 2), zwei Durchmesser und eine vorhandene
  Reststange. Es zeigt alle Bausteine an einem Fall, den man auf einen Blick nachvollzieht —
  inklusive einer Position, die als Fixlängen-Kandidat auffällt. Eigene Zahlen einfach
  darüberschreiben, Zeilen und Listen nach Bedarf ergänzen.
* **Export/Import JSON** — Daten sichern und wieder einlesen. Exportierte Stücklisten sind in
  `.gitignore` ausgenommen und landen nicht versehentlich im Repository.
* **Drucken / PDF** — druckoptimierte Ausgabe für die Baustelle (ohne Sprachumschalter und
  Eingabefelder, in der gerade gewählten Sprache).
* **aus Ring** — je Durchmesser aktivierbar: Material vom Ring (gerichteter Betonstahl) wird
  auf Länge abgelängt, es entsteht kein Schneideverschnitt.
* **Als Datei speichern** — nur online sichtbar: legt das Werkzeug als einzelne HTML-Datei ab,
  für die Arbeit ohne Internet. Gespeichert wird immer die unveränderte Datei, nicht der
  gerade eingetippte Stand — Daten wandern über Export/Import JSON mit.

### Online oder lokal

Beides ist dasselbe Werkzeug, die Wahl ist reine Bequemlichkeit:

* **Online** unter <https://c0re568.github.io/Betoneisen-Schneideplan/> — nichts herunterladen,
  der Link lässt sich weitergeben und am Handy als Lesezeichen ablegen. Gerechnet wird trotzdem
  ausschließlich im Browser; es werden keine Daten an einen Server geschickt.
* **Lokal** als heruntergeladene Datei — funktioniert ohne Internet, etwa auf der Baustelle.
  Der Knopf **Als Datei speichern** oben links auf der Online-Seite legt sie ab; lokal geöffnet
  ist der Knopf ausgeblendet, weil man die Datei dann ja schon hat.

Ein Hinweis zum Speicher: Eingaben und gesetzte Haken liegen im Speicher des Browsers, und der
ist **je Adresse getrennt**. Wer bisher die lokale Datei benutzt hat, findet seine Daten unter
der Online-Adresse nicht wieder (und umgekehrt). Für den Umzug den **Export JSON** auf der einen
Seite und **Import JSON** auf der anderen benutzen.

### Übersetzungen ergänzen

Alle sichtbaren Texte stehen im Objekt `I18N` am Anfang des `<script>`-Blocks, je Sprache ein
Schlüssel-Wert-Paar (Werte mit Platzhaltern sind Funktionen). Eine weitere Sprache braucht nur
einen zusätzlichen Block `xx: { … }` in `I18N` und einen Knopf `<button data-lang="xx">` im
Umschalter. Fehlt ein Schlüssel, greift automatisch der deutsche Text.

---

## English

A tool for cutting rebar bar positions from stock bars with minimum waste
(one-dimensional cutting-stock problem).

Open it in a browser (double-click) — nothing is installed and nothing is uploaded.

### Language

The switch in the top right toggles between **Deutsch** and **English**. The choice is stored in
the browser and reused the next time the file is opened; German is the default. Switching
re-labels the entire interface including a cutting plan that has already been calculated —
inputs, check marks and results are preserved and nothing is recalculated. Number formats follow
the language (`7,00 m` vs. `7.00 m`). Names you typed yourself for bar lists and positions stay
exactly as they are — only the sample data is loaded in whichever language is active.

### What it does

* Handles **several bar lists** at once (e.g. lap splices, top reinforcement, beams).
* Calculates **separately per diameter**; stock length can be set globally or per ø (default 7.00 m).
* Optionally takes **remnant bars already in stock** into account (see below).
* **Kerf width is ignored** (as required).
* Produces a cutting plan in which **every cut piece stays assigned to its position**:
  * cutting-pattern overview (what is cut, and how often),
  * bar-by-bar plan with a position label on each piece (identical bars grouped),
  * reverse lookup "position → which bars was it cut from".
* **A check mark per bar** to tick off while cutting, with a progress display.
* Lists **usable offcuts** above a configurable minimum length.
* **Extra analysis:** which position causes the most waste and is therefore better ordered
  as a fixed length from the mill.

### Position labels

Each bar list gets a letter (A, B, C …) and each piece a label such as `A·4`
(= bar list A, position 4). If the same position number occurs more than once with different
lengths, it is distinguished automatically (`C·UZ6a`, `C·UZ6b`).

### Remnant bars

Under "Remnant bars in stock" you can enter usable remnants from earlier cuts with ø, length and
quantity. They enter the optimisation as extra bars with their own length — with one deliberate
restriction:

> A remnant bar is **only started if doing so saves a new bar.**

Otherwise stock material would be consumed without changing the order quantity — the offcut would
merely move from one pile to another. Order of priority: (1) as few new bars as possible,
(2) as few started remnant bars as possible, (3) as little remnant material consumed as possible.
For each diameter the output states which remnant bars were started, which stay untouched, and
what is left over as a new offcut after cutting. Remnant bars appear in the plan as `R12-01`
(drawn shorter to scale), new bars as `S12-001`.

### Check marks

Every entry in the cutting plan has exactly one box to tick. Where identical bars are grouped, the
check mark applies to all bars of that pattern (noted next to it); ticked entries are struck
through and greyed out. Progress is counted in bars and shown per diameter and in total
("34 / 176 bars cut"). **Reset check marks** clears all of them after a confirmation prompt.

They are stored in two places:

* **Export/import JSON** — the check marks are part of the `done` field and are carried over on
  import (with a message stating how many). This is the reliable way to back up your progress or
  move it to another device.
* **Browser storage** — inputs, check marks and the language choice are cached automatically and
  restored the next time the file is opened on the same device (with a note at the top of the
  page). Some browsers block this for local files; the export then quietly remains the only route.

A check mark is tied to the bar name **and to the bar's contents**. If a recalculation changes a
bar's cutting pattern, its check mark lapses instead of carrying over to a materially different
cut — when in doubt, "still open" beats a false "done". Unchanged bars keep their check marks.
In a test, 37 of 66 check marks survived a quantity change while the 29 altered bars were reset.

### Waste analysis

Two figures per position:

* **Marginal waste** — the extra waste the position causes in the overall plan
  (plan with the position minus plan without it). Only this share can actually be saved by
  ordering a fixed length. Negative = the position fills up other positions' offcuts and lowers
  total waste.
* **Cut on its own** — the waste if the position were cut from the stock bar without being
  combined with other lengths.

A fixed length is only recommended once a position causes at least one full stock bar of waste.
The **fixed** tick box lets you verify this directly: the position drops out of the cutting plan
and the plan is re-optimised.

### Method

A pattern-based heuristic: for each bar, branch & bound searches for the pattern that best fills
the remaining demand, and repeats it as often as possible; best-fit-decreasing and randomised
multi-starts run alongside. Remnant bars are filled beforehand in ascending and in descending
order, and the better variant wins. Solutions are ranked primarily by the number of bars and
secondarily by the largest (and therefore reusable) offcut. The theoretical lower bound
(total length ÷ stock length) is displayed as a benchmark — depending on the mix of lengths it is
not always reachable.

### Usage

* **Load sample data** — a deliberately small example to overwrite: two bar lists ("Slab" with
  3 positions, "Beam" with 2), two diameters and one remnant bar in stock. It shows every building
  block in a case you can follow at a glance — including a position that stands out as a
  fixed-length candidate. Just type your own numbers over it and add rows and lists as needed.
* **Export/import JSON** — back up your data and read it back in. Exported bar lists are excluded
  in `.gitignore` and will not end up in the repository by accident.
* **Print / PDF** — print-optimised output for the site (without the language switch and input
  fields, in the language currently selected).
* **From coil** — can be enabled per diameter: material from a coil (straightened rebar) is cut to
  length, so no cutting waste occurs.
* **Save as file** — only visible online: stores the tool as a single HTML file for working
  without an internet connection. What gets saved is always the unmodified file, not the state
  you just typed in — data travels via export/import JSON.

### Online or local

Both are the same tool; pick whichever is more convenient:

* **Online** at <https://c0re568.github.io/Betoneisen-Schneideplan/> — nothing to download, the
  link can be shared and bookmarked on a phone. Everything is still calculated in the browser
  alone; no data is sent to a server.
* **Local**, as a downloaded file — works without an internet connection, e.g. on site.
  The **Save as file** button at the top left of the online page stores it; when the file is
  already open locally the button is hidden, since you have the file at that point.

One note about storage: inputs and check marks live in the browser's storage, which is **kept
separately per address**. If you have been using the local file, your data will not show up at
the online address (and vice versa). To move it across, use **export JSON** on one side and
**import JSON** on the other.

### Adding translations

All visible text lives in the `I18N` object at the top of the `<script>` block, one key-value pair
per language (values with placeholders are functions). Another language only needs an additional
`xx: { … }` block in `I18N` and a `<button data-lang="xx">` in the switch. If a key is missing, the
German text is used automatically.


## Tests

Im Ordner [`tests/`](tests/) liegen Regressionstests für die Erledigt-Haken und für
**Als Datei speichern**. Sie öffnen `schneideplan.html` in einem echten Browser und bedienen sie
wie ein Anwender (`cd tests && npm ci && npm test`, Details in [`tests/README.md`](tests/README.md)).

Sie laufen bei jedem Push und jedem Pull Request automatisch, und die Online-Version wird nur
veröffentlicht, wenn sie grün sind — kaputt kann dort also nichts landen, ohne dass es vorher
auffällt.

Das Werkzeug bleibt davon unberührt — es ist weiterhin eine einzelne HTML-Datei ohne
Abhängigkeiten. Installiert wird nur, wer die Tests laufen lassen möchte.
