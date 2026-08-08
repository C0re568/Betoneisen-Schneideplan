# Schneideplan Betoneisen

Werkzeug zur verschnittoptimierten Aufteilung von Betonstahl-Stabpositionen auf Lagerstangen
(eindimensionales Zuschnittproblem / cutting stock).

**Datei:** [`schneideplan.html`](schneideplan.html) — eine einzige HTML-Datei ohne Abhängigkeiten.
Im Browser öffnen (Doppelklick), es wird nichts installiert und nichts hochgeladen.

## Was es macht

* Verarbeitet **mehrere Stücklisten** gleichzeitig (z. B. Stoßüberdeckung, Obere Bewehrung, Unterzüge).
* Rechnet **je Durchmesser getrennt**, Lagerlänge global oder je ø einstellbar (Standard 12,00 m).
* **Schnittbreite wird ignoriert** (wie gefordert).
* Gibt einen Schneideplan aus, bei dem **jedes geschnittene Stück seiner Position zugeordnet bleibt**:
  * Schnittmuster-Übersicht (was wird wie oft geschnitten),
  * Plan Stange für Stange mit Positions-Kennzeichnung je Stück (identische Stangen zusammengefasst),
  * Rückwärts-Zuordnung „Position → aus welchen Stangen geschnitten".
* Listet **verwertbare Reststücke** ab einer einstellbaren Mindestlänge.
* **Zusatzauswertung:** welche Position den meisten Verschnitt verursacht und daher besser
  in Fixlängen ab Werk bestellt wird.

## Positions-Kennzeichnung

Jede Stückliste bekommt einen Buchstaben (A, B, C …), jedes Stück das Etikett `A·4`
(= Stückliste A, Position 4). Kommt eine Positionsnummer mehrfach mit verschiedenen Längen vor,
wird sie automatisch unterschieden (`C·UZ6a`, `C·UZ6b`).

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
Best-Fit-Decreasing und randomisierte Mehrfachstarts. Bewertet wird primär die Stangenanzahl,
sekundär ein möglichst großes (und damit verwertbares) Reststück. Angezeigt wird auch die
rechnerische Untergrenze (Gesamtlänge ÷ Lagerlänge) als Vergleichsmaßstab — diese ist je nach
Längenkombination nicht immer erreichbar.

## Bedienung

* **Beispieldaten laden** — die Stücklisten aus den Plänen (Pos. 1–18) plus Unterzüge UZ1–UZ6.
* **Export/Import JSON** — Daten sichern und wieder einlesen.
* **Drucken / PDF** — druckoptimierte Ausgabe für die Baustelle.
* **aus Ring** — je Durchmesser aktivierbar: Material vom Ring (gerichteter Betonstahl) wird
  auf Länge abgelängt, es entsteht kein Schneideverschnitt.
