# Tests

Regressionstests für `schneideplan.html`. Sie öffnen die Datei in einem echten Browser
(Chromium, über Playwright) und bedienen sie wie ein Anwender.

Das Werkzeug selbst bleibt davon unberührt: `schneideplan.html` ist weiterhin eine einzelne
Datei ohne Abhängigkeiten, die man per Doppelklick öffnet. Was hier installiert wird, braucht
nur, wer die Tests laufen lassen will.

```bash
cd tests
npm ci
npx playwright install chromium   # einmalig, lädt den Browser
npm test
```

Dieselben Tests laufen bei jedem Push und jedem Pull Request automatisch
(`.github/workflows/ci.yml`). Die Online-Version wird nur veröffentlicht, wenn sie grün sind.

Ist bereits ein Chromium vorhanden, lässt sich der Download überspringen:

```bash
CHROMIUM_PATH=/pfad/zu/chromium npm test
```

Der Testlauf endet mit Rückgabewert 0, wenn alles bestanden ist, sonst mit 1.

## Was geprüft wird

`erledigt-haken.test.mjs` deckt die Erledigt-Haken ab — den Teil mit Zustand, der beim
Neuberechnen und beim Umschalten der Gruppierung am ehesten kaputtgeht:

* je Plan-Eintrag genau ein Kästchen, das alle Stangen seines Schnittmusters abhakt,
* Fortschritt zählt in Stangen, nicht in Einträgen, und summiert sich über die Durchmesser auf,
* Umschalten von „identische Stangen zusammenfassen" verwirft keine gesetzten Haken,
* teilweise abgehakte Gruppen aus importierten Altdaten erscheinen als teilweise gesetzt,
* **Haken zurücksetzen** leert Anzeige und Speicher,
* Haken überstehen einen Reload (Browser-Speicher),
* Haken verfallen, wenn eine Neuberechnung das Schnittmuster ändert,
* keine JavaScript-Fehler in der Konsole.

`stueckliste-fortschritt.test.mjs` deckt die Spalte **erledigt** in der Stückliste ab — die
Rückrechnung von den abgehakten Stangen auf die einzelnen Positionen:

* vor der Berechnung steht die Spalte neutral, danach jede Position auf „offen",
* ein Haken im Plan schlägt genau bei den betroffenen Positionen durch, Stück für Stück,
* vollständig geschnittene Positionen werden grün und durchgestrichen dargestellt,
* Abwählen und **Haken zurücksetzen** nehmen den Fortschritt zurück,
* eine nach der Berechnung geänderte Zeile verlangt „neu rechnen", die übrigen bleiben unberührt,
* Fixlängen stehen als „nicht im Plan" und lassen sich nicht abhaken,
* die Beschriftungen wechseln mit der Sprache,
* keine JavaScript-Fehler in der Konsole.

`datei-speichern.test.mjs` deckt den Knopf **Als Datei speichern** ab:

* lokal geöffnet (`file://`) bleibt der Knopf verborgen — dort hat man die Datei bereits,
* online erscheint er, samt Beschriftung in beiden Sprachen,
* gespeichert wird das unveränderte Original, nicht das laufende DOM: der Test tippt vorher
  Daten ein und rechnet einen Plan, die Datei muss trotzdem Byte für Byte der Quelle entsprechen,
* die gespeicherte Datei ist für sich lauffähig und rechnet lokal ohne Fehler weiter.

Geprüft wird gegen die eingebauten Beispieldaten. Ändern sich diese, passen sich die Tests
mit an — sie rechnen die erwarteten Zahlen aus dem gerenderten Plan aus, statt sie fest
zu verdrahten. Nur die Annahme „es gibt mindestens eine zusammengefasste Gruppe" ist
notwendig und wird als eigener Test ausgewiesen.
