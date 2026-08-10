# Schneideplan Betoneisen

Werkzeug zur verschnittoptimierten Aufteilung von Betonstahl-Stabpositionen auf Lagerstangen
(eindimensionales Zuschnittproblem / cutting stock).

**Datei:** [`schneideplan.html`](schneideplan.html) — eine einzige HTML-Datei ohne Abhängigkeiten.
Im Browser öffnen (Doppelklick), es wird nichts installiert und nichts hochgeladen.

## Was es macht

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

## Positions-Kennzeichnung

Jede Stückliste bekommt einen Buchstaben (A, B, C …), jedes Stück das Etikett `A·4`
(= Stückliste A, Position 4). Kommt eine Positionsnummer mehrfach mit verschiedenen Längen vor,
wird sie automatisch unterschieden (`C·UZ6a`, `C·UZ6b`).

## Reststangen

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

## Erledigt-Haken

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
* **Browser-Speicher** — Eingaben und Haken werden automatisch zwischengespeichert und beim
  nächsten Öffnen auf demselben Gerät wiederhergestellt (mit Hinweis oben auf der Seite).
  Manche Browser sperren das bei lokalen Dateien; dann greift lautlos nur der Export.

Ein Haken hängt am Stangennamen **und am Inhalt der Stange**. Ändert sich nach einer
Neuberechnung das Schnittmuster einer Stange, verfällt ihr Haken, statt auf einem inhaltlich
anderen Schnitt stehen zu bleiben — im Zweifel lieber „noch offen" als fälschlich „erledigt".
Unveränderte Stangen behalten ihren Haken. Im Test blieben nach einer Mengenänderung
37 von 66 Haken erhalten, die 29 geänderten Stangen wurden zurückgesetzt.

## Verschnitt-Analyse

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

## Rechenverfahren

Musterbasierte Heuristik: für jede Stange wird per Branch & Bound das am besten füllende
Schnittmuster für den Restbedarf gesucht und maximal oft wiederholt; zusätzlich laufen
Best-Fit-Decreasing und randomisierte Mehrfachstarts. Reststangen werden vorab in
aufsteigender und absteigender Reihenfolge belegt, die bessere Variante gewinnt.
Bewertet wird primär die Stangenanzahl,
sekundär ein möglichst großes (und damit verwertbares) Reststück. Angezeigt wird auch die
rechnerische Untergrenze (Gesamtlänge ÷ Lagerlänge) als Vergleichsmaßstab — diese ist je nach
Längenkombination nicht immer erreichbar.

## Bedienung

* **Beispieldaten laden** — ein bewusst kleines Beispiel zum Überschreiben: zwei Stücklisten
  („Platte" mit 3 Positionen, „Unterzug" mit 2), zwei Durchmesser und eine vorhandene
  Reststange. Es zeigt alle Bausteine an einem Fall, den man auf einen Blick nachvollzieht —
  inklusive einer Position, die als Fixlängen-Kandidat auffällt. Eigene Zahlen einfach
  darüberschreiben, Zeilen und Listen nach Bedarf ergänzen.
* **Export/Import JSON** — Daten sichern und wieder einlesen. Exportierte Stücklisten sind in
  `.gitignore` ausgenommen und landen nicht versehentlich im Repository.
* **Drucken / PDF** — druckoptimierte Ausgabe für die Baustelle.
* **aus Ring** — je Durchmesser aktivierbar: Material vom Ring (gerichteter Betonstahl) wird
  auf Länge abgelängt, es entsteht kein Schneideverschnitt.

## Tests

Im Ordner [`tests/`](tests/) liegen Regressionstests für die Erledigt-Haken. Sie öffnen
`schneideplan.html` in einem echten Browser und bedienen sie wie ein Anwender
(`cd tests && npm install && npm test`, Details in [`tests/README.md`](tests/README.md)).

Das Werkzeug bleibt davon unberührt — es ist weiterhin eine einzelne HTML-Datei ohne
Abhängigkeiten. Installiert wird nur, wer die Tests laufen lassen möchte.
