# Dokumentation: Upgrade auf Next.js 15 & React 19

Dieses Dokument erklärt die Änderungen am Projekt für das Upgrade auf die neuesten Versionen von Next.js und React.

## 1. Was wurde gemacht?
Wir haben die Kern-Technologien der Website auf den aktuellsten Stand (Next.js 15 und React 19) gebracht.

### Die wichtigsten Schritte:
*   **Update der Software-Bibliotheken:** Wir haben `next`, `react` und `react-dom` in den Versionen aktualisiert, die schneller und zukunftssicherer sind.
*   **Icon-Fix:** Die Bibliothek für unsere Icons (`lucide-react`) musste ebenfalls aktualisiert werden, da die alte Version nicht mit dem neuen React 19 kompatibel war. Das war der Grund für den Fehler in deinem Vercel-Dashboard.
*   **Code-Anpassung:** In der neuen Version von Next.js werden bestimmte Daten (wie die URL-Parameter für die Räume) asynchron geladen. Wir haben den Code so vorbereitet, dass diese Daten korrekt "erwartet" werden (`await`), damit es in der Live-Umgebung nicht zu Fehlern kommt.

## 2. Was bringt das für KinkyFoxGames?
*   **Bessere Performance:** Die Website lädt schneller (bessere PageSpeed-Werte), besonders auf dem Handy.
*   **Flüssigeres UI:** React 19 hat einen neuen "Compiler", der dafür sorgt, dass die Seite effizienter aktualisiert wird, wenn du z.B. den Timer startest oder würfelst.
*   **Weniger Bugs in der Zukunft:** Da wir jetzt auf dem neuesten Stand sind, ist es einfacher, neue Features hinzuzufügen, ohne dass alte Code-Teile im Weg stehen.

## 3. Aktueller Status
Alle Änderungen befinden sich auf dem Branch **`feature/next15-upgrade`**. 
Sobald du die Preview auf Vercel getestet hast und alles (Sync, Timer, Bilder) läuft, können wir diese Änderungen in die Hauptversion (`main`) übernehmen.

---
*Erstellt am: 07.04.2026 von Ludwig*
