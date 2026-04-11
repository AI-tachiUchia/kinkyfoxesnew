# KinkyFoxGames: Bekannte Probleme (Issues)

- [ ] **QR-Codes:** Die generierten QR-Codes sind zwar mit den meisten Standard-Apps lesbar, funktionieren aber nicht unter bestimmten Implementierungen wie der **ZXing QR-Code Library** (und möglicherweise anderen Protokollen). Wir müssen prüfen, ob das am Format, am Kontrast oder an der Codierung liegt.
- [ ] **Accessibility (Login):** Die Input-Felder auf der Login-Seite benötigen explizite HTML-Labels für bessere Barrierefreiheit und Usability (PageSpeed/Accessibility Score).

## Setup-Formular Aufräumen (geplanter Umbau)

Der Server-seitige `heatLevel` ist bereits auf **5 Stufen** ausgelegt (`app/api/generate/route.ts` Z. 174–181: soft/romantic → flirty → kinky → intense → maximum). Der UI-Slider nutzt das bisher nicht voll aus, und das Setup-Formular enthält zwei Felder, die dadurch redundant bzw. funktionslos werden.

- [x] **Heat-Level-Slider auf 5 Stufen bringen.** ~~Aktuell exponiert das UI weniger Stufen als der Server versteht.~~ Erledigt in `5715809` (2026-04-11) — Slider zeigt volle `1..5`-Auswahl mit Labels aus `translations.ts` (Kuschelkurs / Flirty / Spicy / Kinky / "Ich judge nicht, aber seid ihr sicher?") und passender Legende.
- [x] **Atmosphäre-Dropdown entfernen.** Erledigt in `5715809` — State, Broadcast-Sync, API-Body und Server-Prompt sauber entfernt.
- [x] **Veils-Textfeld ersetzen durch "Special Wishes for Game Rules and Atmosphere".** Erledigt in `5715809` — `vibe`-Feld trägt jetzt das klare Label, Veils komplett raus (UI, State, Broadcast, API, Prompt). Hard-Limits bleibt als harte Safety-Rail.

**Abhängigkeiten:** Alle drei Änderungen wurden in einem gemeinsamen Commit (`5715809`) umgesetzt, build grün.
