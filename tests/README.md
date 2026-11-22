# Tests für Smart Gains

Prüfen die App (`../index.html`) automatisch in einem simulierten iPhone-Browser.
Die KI wird dabei nur simuliert, es entstehen keine API-Kosten.

## Einmalig einrichten

```
cd tests
npm install
npx playwright install chromium
```

## Ausführen

```
cd tests
npm test              # alle Tests
node run-all.js prefs # nur Tests, deren Dateiname "prefs" enthält
```

Am Ende steht z. B. `22/22 Testdateien ok`. Bei Fehlern werden die
betroffenen Prüfungen mit `FAIL` aufgelistet.

Screenshots aus den Tests landen im temporären Ordner des Systems.
