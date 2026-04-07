# Implementierungsplan: Next.js 15 & React 19 Upgrade

## 1. Zielsetzung
Upgrade von KinkyFoxGames von Next.js 14.2.3 / React 18 auf Next.js 15 / React 19 zur Verbesserung der Performance (Web Vitals) und Zukunftsfähigkeit.

## 2. Technische Änderungen

### A. Dependency Update
*   `next`: `^15.0.0`
*   `react`: `^19.0.0`
*   `react-dom`: `^19.0.0`
*   `devDependencies`: `@types/react` und `@types/react-dom` auf `^19.0.0` anpassen.
*   Check der Kompatibilität von `lucide-react`, `react-markdown` und `sharp`.

### B. Code-Anpassungen (Breaking Changes)
*   **Async Dynamic APIs:** `params` und `searchParams` in Server-Komponenten (Layouts, Pages, Metadata) sind nun Promises. Überall `await` oder `use()` hinzufügen.
*   **API Routes:** In `app/api/...` sicherstellen, dass Request-Handling der neuen Next.js 15 Spezifikation entspricht.
*   **Caching Policy:** Überprüfung der Fetch-Aufrufe (Supabase), da Next.js 15 GET-Requests standardmäßig nicht mehr cached. Explizites Caching einbauen, wo sinnvoll.
*   **React 19 Refactoring:** Optionale Nutzung von `useActionState` für Generator-Formulare zur Vereinfachung des Loading-State-Managements.

## 3. Workflow & Sicherheit
1.  **Branching:** Erstellung eines dedizierten Branches `feature/next15-upgrade`.
2.  **Lokal Testing:** Vollständiger Durchlauf des Game-Generators, Partner-Syncs und Dice-Rollers in der Entwicklungsumgebung.
3.  **Vercel Preview:** Deployment einer Preview-URL zum Testen der Live-Performance und Edge-Functions.
4.  **Merge:** Erst nach expliziter Freigabe durch Tim in den `main` Branch.

## 4. Konsequenzen
*   **Positiv:** Bessere PageSpeed-Werte (LCP, Hydration), effizienteres Rendering der Fuchs-Assets durch React 19 Compiler-Optimierungen.
*   **Risiko:** Potenzielle Runtime-Errors durch vergessene `await` bei Params; Zeitaufwand für manuelles Testing aller Core-Features (Sync, Timer, Dice).

---
*Erstellt am: 07.04.2026 von Ludwig*
