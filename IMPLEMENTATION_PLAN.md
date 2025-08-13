# BEST Framework – Vollständige Analyse & Implementierungsleitfaden

> Ziel: Repository so umbauen, dass es als installierbares Package direkt via GitHub (z.B. in package.json: "best": "git+https://github.com/Cyber-Luke/best-api-testing.git") konsumiert werden kann, einen interaktiven Onboarding-/Init-Prozess bietet, automatisch eine Standard-Verzeichnisstruktur (`api-integration-tests/`), einen erneut generierten GraphQL-Client sowie Coverage über verwendete Operationen erzeugt und konfigurierbar über `best.config.json` ist.

---

## 1. Zielsetzung

1. Das Projekt unter neuem konsistenten Paket-Namen (z.B. `best-api-testing` oder kurz `best`) als CLI + Programmbibliothek bereitstellen.
2. Installation direkt über GitHub-URL ohne manuelles Bauen beim Konsumenten.
3. Interaktiver Onboarding-Prozess (`best init`) der:
   - `best.config.json` erzeugt oder aktualisiert
   - Ordnerstruktur `api-integration-tests/` (inkl. `tests/`, `graphql/` – letzterer wird generiert) anlegt
   - Beispiel-Test (TypeScript) erstellt
   - Fehlerbehandlung & Wiederholoptionen bietet
4. Automatische (Re)Generierung des GraphQL Clients bei `best run` (sofern Schema oder Konfiguration geändert oder erzwungen) + Anzeige wie viele generierte Operationen abgedeckt (mindestens einmal in Tests aufgerufen) sind.
5. Konfigurierbares Coverage-Threshold (optional Build-Fail / Exit-Code bei Unterdeckung).
6. Migration von bestehendem `integration-test.config.json` → neue `best.config.json`.
7. Bereitstellung eines stabilen Binär-Eintrags (`bin`) damit `npx best ...` funktioniert.
8. ESM-kompatibel, TypeScript-Deklarationen exportiert.
9. Minimale, klar dokumentierte API-Oberfläche & Erweiterungs-Perspektiven.

---

## 2. Aktueller Stand (IST)

| Bereich          | Status                                                   | Anmerkungen                                                                                                                |
| ---------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Build            | `tsc` generiert nach `dist/`                             | Dist nicht versioniert (prüfen). Für GitHub-Installation muss Dist entweder committed oder via `prepare` generiert werden. |
| CLI              | `cli.ts` mit Commands `init`, `run`, `print-config`      | Kein interaktives Onboarding, Tests werden aus `dist/tests` geladen (erfordert Build der Tests).                           |
| Config           | `integration-test.config.json` + Defaults                | Neuer Name nötig (`best.config.json`), zusätzliche Felder (testDir, outputRoot, coverage).                                 |
| Codegen          | Minimaler Generator für Queries, Mutations, Types, Utils | Kein Coverage-Hook, kein differentielles Regenerieren.                                                                     |
| Tests Discovery  | Lädt nur kompilierte JS-Dateien aus `dist/tests`         | Für Nutzer-Onboarding besser direkte `.ts` Discovery im Nutzerprojekt (Transpile on the fly).                              |
| Auth             | basic / bearer / none                                    | OK, später erweiterbar (Plugins / Hooks).                                                                                  |
| Fehlerbehandlung | Minimal (nur Console + Exit Code)                        | Besser strukturierte Fehlerklassen & Reporting.                                                                            |
| Distribution     | Kein `bin`, kein `files` Feld                            | Muss ergänzt werden.                                                                                                       |

---

## 3. Soll-Konzept (High-Level)

```
User Projekt Root
└── best.config.json
└── api-integration-tests/
    ├── tests/
    │   └── example.test.ts
    ├── graphql/ (GENERATED - nicht versionieren)
    │   ├── index.ts
    │   ├── queries/index.ts
    │   ├── mutations/index.ts
    │   ├── types/index.ts
    │   └── utils.ts
    └── .gitignore (enthält /graphql falls gewünscht)
```

Command UX:

- `best init` → interaktiv / oder `--yes` für defaults
- `best generate` → optional manuell
- `best run [--pattern=xyz] [--no-generate] [--coverage-report=json|table]`
- `best coverage` → nur Coverage-Auswertung (ohne erneutes Ausführen) (optional)

---

## 4. Paketierung & Distribution

Änderungen an `package.json` (Beispiel):

```json
{
  "name": "best-api-testing",
  "version": "0.2.0",
  "type": "module",
  "bin": { "best": "dist/cli.js" },
  "main": "dist/index.js", // optional: zentraler Export (falls gewünscht)
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./framework": "./dist/framework/index.js" // falls Aggregation
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepare": "npm run build", // wichtig für GitHub-Installation
    "dev": "tsx src/cli.ts run --watch"
  }
}
```

Wichtig: `prepare` wird bei GitHub-Install automatisch ausgeführt (Nutzer braucht keine vorkompilierte Dist im Repo, außer man möchte deterministische Artefakte → dann Dist committen).

Shebang in `src/cli.ts` ist bereits vorhanden (`#!/usr/bin/env node`). Sicherstellen, dass es in `dist/cli.js` durch `tsc` erhalten bleibt (ist Standard sofern erster Kommentarblock).

Option: Dist committen + `package.json` ohne `prepare` (schneller für Konsumenten). Empfehlung: **`prepare`** benutzen, Dist bleibt ungecommitted.

---

## 5. CLI-Design & Interaktiver Onboarding-Prozess

Bibliothek: `prompts`, `enquirer` oder `inquirer`. (Leichtgewichtig: `prompts`).

Ablauf `best init`:

1. Prüfen ob alte `integration-test.config.json` existiert → Migration anbieten → umbenennen & Mappings.
2. Falls `best.config.json` existiert → anbieten zu aktualisieren (nur bestimmte Felder ändern?).
3. Fragen:
   - Endpoint (default: http://localhost:3000/graphql)
   - Auth-Typ (none/basic/bearer)
   - Falls basic → Username, Password (masked) / Falls bearer → Token (masked)
   - Zusätzliche Header? (JSON Eingabe / Skip)
   - Root Output Dir (default: `api-integration-tests`)
   - Testordner (default: `tests` relativ zu Root)
   - Coverage Mindestwerte? (Queries %, Mutations %, Global %) – optional
4. Schreiben `best.config.json`.
5. Erstellen Ordnerstruktur `api-integration-tests/tests` falls nicht vorhanden.
6. Beispieltest nur anlegen wenn keine anderen Tests existieren.
7. Introspection + Codegen ausführen (Fehler dialogisch behandeln → Retry?).
8. Abschließende Zusammenfassung + nächste Schritte.

Fehlerbehandlung:

- Netzwerkausfall → Nachricht + Option `Retry / Abbrechen / Weiter ohne Codegen`.
- Ungültiger Endpoint (Status != 200) → detaillierter Fehler.

Flags:

- `--yes` / `-y` → Nur Defaults, nicht interaktiv.
- `--force` → überschreibt existierende Beispiel-Dateien.

---

## 6. Verzeichnisstruktur & Konfiguration

Neue Felder in `best.config.json` (Schema-Vorschlag):

```jsonc
{
  "endpoint": "http://localhost:3000/graphql",
  "auth": { "type": "none" },
  "headers": { "x-trace": "dev" },
  "schemaFile": "api-integration-tests/schema.json", // relocatet
  "outputRoot": "api-integration-tests", // NEU
  "generatedDir": "api-integration-tests/graphql", // Ableitung möglich
  "testDir": "api-integration-tests/tests", // NEU
  "coverage": {
    "enabled": true,
    "failOnBelow": false,
    "minPercentTotal": 60,
    "minPercentQueries": 50,
    "minPercentMutations": 40,
    "reportFormats": ["table"] // table | json | summary
  }
}
```

`loadConfig()` muss angepasst (Dateiname + neue Felder + Defaults + Backward Migration).

---

## 7. Test Discovery (TS direkt statt dist/tests)

Aktuell: Lädt aus `dist/tests`. Neue Strategie:

- `testDir` aus Config lesen.
- Alle Dateien `**/*.test.ts` oder `**/*.test.[cm]?js` laden.
- Für `.ts` on-the-fly Kompilierung:
  - Option A: `tsx` als Laufzeit-Dependency (einfach) → `import('file://...')` funktioniert.
  - Option B: eigener ESBuild Loader (mehr Aufwand).
- Empfehlung: `tsx` in `dependencies` verschieben (nicht dev), damit Konsumenten ohne TS-Konfiguration Tests ausführen können.

---

## 8. Automatische (Re)Generierung & Invalidierung

Strategie bei `best run`:

1. Hash bilden aus: (Datei-Inhalt `schemaFile` (falls existiert), Config relevante Felder). Wenn `schemaFile` fehlt → introspect + generate.
2. Optionaler Zeitstempel-Vergleich: Wenn `schemaFile` älter als X Stunden und Flag `--refresh-schema` nicht gesetzt → trotzdem lassen. (Optional / später.)
3. Flag `--no-generate` unterdrückt Auto-Rebuild.
4. Immer vor Tests introspection + generate, wenn `schemaFile` älter als N Sekunden ODER `--force-generate`.

Minimal-Implementierung (einfach): Standard: Immer introspection + generate (benötigt kaum Zeit in kleinen Schemas) – konfigurierbar.

---

## 9. Coverage Tracking (Operation Usage)

Ziel: Anteil genutzter generierter Operationen (Query & Mutation Root Fields) ermitteln.

Implementierung:

1. Neues Modul `src/framework/coverage.ts`:

```ts
const used = new Set<string>();
const all = new Set<string>();
export function registerOperation(name: string) {
  all.add(name);
}
export function markUsed(name: string) {
  used.add(name);
}
export function getCoverage() {
  const total = all.size;
  const covered = used.size;
  return { total, covered, percent: total ? (covered / total) * 100 : 100 };
}
export function coverageReportByPrefix(prefix: "query" | "mutation") {
  /* optional */
}
```

2. Generator erweitert jede Operation:

```ts
registerOperation('query:users');
export async function users(...) {
  markUsed('query:users');
  ...
}
```

3. Runner nach Abschluss: Coverage berechnen + Ausgabe + Threshold Check.
4. Unterscheidung Query / Mutation: Präfix.
5. Konfiguration `coverage.failOnBelow` + Grenzwerte prüfen → Exit Code.
6. Reporting:
   - table: ASCII Tabelle
   - json: JSON dump
   - summary: Einzeiler

Optionale Erweiterung: Pro Testdatei Coverage (Mapping über `Error().stack` parsing) – später.

---

## 10. Fehler- und UX-Verbesserungen

- Eigene Fehlerklassen (`IntrospectionError`, `GenerationError`, `ConfigError`).
- Konsistente farbliche Ausgabe (abhängig vom Ziel – optional `picocolors`).
- Exit Codes: 0 (ok), 1 (Testfehler / Coverage miss), 2 (Konfig-Fehler), 3 (Interne Fehler).

---

## 11. Migrationslogik

Beim ersten `best init` / `best run`:

- Falls `integration-test.config.json` existiert und keine `best.config.json` → Warnung + automatische Umbenennung + Anpassung Pfade (Schema & generatedDir verschieben in `api-integration-tests/`).
- Bestehende `src/graphql` (alt) → Verschieben nach `api-integration-tests/graphql` oder Warnung wenn Nutzer manuell angepasst.

---

## 12. Security & Secrets

- `.env` weiterhin unterstützt (dotenv laden vor Config Merge).
- Sensible Auth-Felder nicht ungefiltert in Logs ausgeben.
- Optional: `best config redact` (später) – nicht Teil MVP.

---

## 13. Performance

- Introspection nur bei Bedarf / oder Standard einfach immer (optimierbar bei großen Schemas).
- Codegen in-memory Strings → Write Files nur bei Änderung (Hash-Vergleich pro Datei) → minimiert Git Diff Rauschen & unnötige I/O.

---

## 14. Erweiterbarkeit (Future)

- Plugins: Hook-System (`beforeIntrospection`, `afterGenerate`, `beforeTest`, `afterTest`, `afterAll`).
- Reporter: JSON / JUnit / HTML.
- Mutation Flow Patterns + Snapshot Save/Restore.
- Watch Mode: Beobachtet Tests + Config + Schema Query (Poll) → Re-run.
- Custom Scalar Mapping Konfiguration.
- GraphQL SDL Output generieren (optional für Vergleich mit Versionierung).

---

## 15. Schritt-für-Schritt Backlog (Epics → Tasks)

### Epic A: Packaging & Distribution

- [ ] `package.json` anpassen (bin, files, prepare, exports)
- [ ] README Abschnitte für GitHub Install (npm install git+...)
- [ ] Type Declarations sicherstellen (declaration: true) & sinnvollen Root-Export (optional `index.ts` erstellen)

### Epic B: Config & Migration

- [ ] `config.ts` → Dateiname standardisieren: `best.config.json`
- [ ] Defaults ergänzen (outputRoot, generatedDir, testDir, coverage)
- [ ] Migration Code implementieren

### Epic C: CLI Rework

- [ ] Command Parser (simpel: eigener Switch oder minimal `commander` – optional)
- [ ] `init` interaktiv (prompts)
- [ ] Flags `--yes`, `--force`, `--no-generate`, `--pattern`
- [ ] Hilfe / Usage aktualisieren

### Epic D: Directory Bootstrapping

- [ ] Erstellen `api-integration-tests/tests`
- [ ] Sample Test generieren (nur falls leer)
- [ ] `.gitignore` Eintrag `graphql/` optional

### Epic E: Test Discovery

- [ ] Replace `dist/tests` Loader → dynamischer Loader `testDir`
- [ ] `.ts` Support via `tsx`
- [ ] Pattern Matching `**/*.test.(ts|js|mjs|cjs)`

### Epic F: Introspection & Codegen Pipeline Verbesserungen

- [ ] Schema Pfad an Config koppeln (`outputRoot`)
- [ ] Option: Immer neu generieren (MVP)
- [ ] Später: Hash basierte Skip-Logik

### Epic G: Coverage

- [ ] `coverage.ts` Modul
- [ ] Generator: `registerOperation()` + `markUsed()` einfügen
- [ ] Runner: Ausgabe + Threshold Evaluation
- [ ] CLI Output Format Auswahl

### Epic H: Fehler & Logging

- [ ] Fehlerklassen
- [ ] Einheitliches Logging (prefix `[best]`)
- [ ] Farben (optional)

### Epic I: Dokumentation

- [ ] Neue README Sektionen (Onboarding, Coverage, Config Schema)
- [ ] Changelog (SemVer Start 0.2.0)

### Epic J: Qualität

- [ ] Self-Test Script (Beispiel GraphQL Mock Endpoint?)
- [ ] Lint / Type Check (optional)

---

## 16. Beispiel Neue `package.json` (relevante Auszüge)

```json
{
  "name": "best-api-testing",
  "version": "0.2.0",
  "type": "module",
  "bin": { "best": "dist/cli.js" },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepare": "npm run build"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "graphql": "^16.10.0",
    "node-fetch": "^3.3.2",
    "reflect-metadata": "^0.2.2",
    "prompts": "^2.4.2",
    "tsx": "^4.19.2" // jetzt runtime
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^24.2.1"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  }
}
```

---

## 17. Beispiel `best.config.json`

```json
{
  "endpoint": "http://localhost:3000/graphql",
  "auth": { "type": "none" },
  "schemaFile": "api-integration-tests/schema.json",
  "outputRoot": "api-integration-tests",
  "generatedDir": "api-integration-tests/graphql",
  "testDir": "api-integration-tests/tests",
  "coverage": {
    "enabled": true,
    "failOnBelow": false,
    "minPercentTotal": 50,
    "minPercentQueries": 40,
    "minPercentMutations": 30,
    "reportFormats": ["table", "summary"]
  }
}
```

---

## 18. Beispiel Generierter Operation Wrapper (neu mit Coverage)

```ts
import { call } from "../utils.js";
import { registerOperation, markUsed } from "../../framework/coverage.js";
registerOperation("query:allPizzas");
export async function allPizzas() {
  markUsed("query:allPizzas");
  const q = `query allPizzas { allPizzas { id name } }`;
  const r = await call<{ allPizzas: { id: string; name: string }[] }>(q);
  if (r.errors) throw new Error(r.errors.map((e) => e.message).join("; "));
  return r.data!.allPizzas;
}
```

---

## 19. Runner Coverage Ausgabe Beispiel

```
[best] Tests abgeschlossen: 12/12 passed in 1.24s
[best] Coverage (Queries): 8/10 (80.00%)
[best] Coverage (Mutations): 2/4 (50.00%)
[best] Coverage (Total): 10/14 (71.43%)
```

Exit Code 1 falls `failOnBelow` und Grenzwert verletzt.

---

## 20. Beispiel Sample Test (nach Init erzeugt)

```ts
import { queries } from "../graphql/index.js";
import { Test } from "../../node_modules/best-api-testing/dist/framework/decorators.js"; // oder sauberer Re-Export bereitstellen

export class ExampleTests {
  @Test
  static ping() {
    return {
      execute: async () => {
        const data = await queries.health();
        return { data };
      },
      effects: [
        {
          name: "health-not-null",
          validate: (ctx) => !!ctx.data,
          onFailureMessage: "Health query lieferte null",
        },
      ],
    };
  }
}
```

Optimierung: Einen Aggregat-Export `export * from './framework/decorators.js'` in `index.ts` anbieten → Import kürzer: `import { Test } from 'best-api-testing';`.

---

## 21. Risiken & Mitigation

| Risiko                              | Beschreibung                                  | Lösung                                                               |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| GitHub Install Fail (fehlende Dist) | Falls `prepare` nicht greift (Offline CI)     | Dist committen als Fallback / Doku Hinweis                           |
| TypeScript Inkompatibilität         | Nutzer hat TS < 5                             | PeerDependencies / Hinweis min Version                               |
| Node Fetch ESM Issues               | In CJS Umgebungen                             | ESM only klar dokumentieren                                          |
| Coverage Mess-Inflation             | Operation indirekt geladen aber nicht genutzt | `markUsed` nur innerhalb der Funktion, nicht bei `registerOperation` |
| Namenskollision                     | Operation Name identisch Query/Mutation       | Präfix `query:` / `mutation:` benutzen                               |
| Performance bei großem Schema       | Immer Re-Introspect teuer                     | Später optionaler Hash / Cache Mechanismus                           |

---

## 22. Checkliste Umsetzung (Kurzfassung)

- [ ] package.json aktualisieren (bin, prepare, dependencies → prompts/tsx)
- [ ] `index.ts` Root-Export hinzufügen (Re-Exports Decorators, Runner APIs falls sinnvoll)
- [ ] `config.ts` → Umstellung auf `best.config.json`, neue Felder + Migration
- [ ] CLI umbauen: Parser + neue Flags + interaktives `init`
- [ ] Ordner-Bootstrap + Sample-Test Erstellung
- [ ] Test Discovery auf `testDir` + tsx Runtime
- [ ] Codegen anpassen: Pfade relativ zu `generatedDir` / `outputRoot`
- [ ] Coverage Modul + Integration in Generator & Runner
- [ ] Runner: Coverage Reporting + Threshold Handling
- [ ] Dokumentation (README + Schema Tabelle)
- [ ] QA: Testen end-to-end in frischem Projekt (npm install aus GitHub)
- [ ] Tag/Release (z.B. `v0.2.0`)

---

## 23. Erweiterungen (Optionale Vorschläge)

- Watch Mode (`best watch`) → File System Watcher auf `testDir` + Re-Run Debounce
- Reporter Interface (`--reporter=junit|json|table`)
- Snapshot Mechanismus für komplexe Objekte
- GraphQL Operation Selektor (Custom Selection Sets in Config)
- Hooks / Plugin System
- Auth Provider Plugins (z.B. JWT Refresh Flow)
- Telemetry Opt-In (anonymisierte Nutzungsdaten)

---

## 24. Zusammenfassung

Dieses Dokument liefert eine vollständige Roadmap, um das bestehende Repository in ein konsumierbares, erweiterbares, interaktives und coverage-bewusstes GraphQL API Test Framework zu transformieren. Startpunkt ist die Anpassung der Paket-Struktur (bin + prepare), gefolgt von der Einführung einer verbesserten Konfigurations- & Onboarding-Erfahrung, automatischer Codegenerierung und Messung der tatsächlichen Testabdeckung auf Operationsebene. Die sequenziellen Epics ermöglichen eine schrittweise, risikoarme Umsetzung.

---

Bei Bedarf kann ein verfeinerter Taskplan (Issue Templates) oder ein initialer PR-Splits Vorschlag erstellt werden.
