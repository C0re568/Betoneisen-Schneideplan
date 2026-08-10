# Tests

Regressionstests für `schneideplan.html`. Sie öffnen die Datei in einem echten Browser
(Chromium, über Playwright) und bedienen sie wie ein Anwender.

Das Werkzeug selbst bleibt davon unberührt: `schneideplan.html` ist weiterhin eine einzelne
Datei ohne Abhängigkeiten, die man per Doppelklick öffnet. Was hier installiert wird, braucht
nur, wer die Tests laufen lassen will.

```bash
cd tests
npm install
npx playwright install chromium   # einmalig, lädt den Browser
npm test
```

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

Geprüft wird gegen die eingebauten Beispieldaten. Ändern sich diese, passen sich die Tests
mit an — sie rechnen die erwarteten Zahlen aus dem gerenderten Plan aus, statt sie fest
zu verdrahten. Nur die Annahme „es gibt mindestens eine zusammengefasste Gruppe" ist
notwendig und wird als eigener Test ausgewiesen.
