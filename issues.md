# KinkyFoxGames: Bekannte Probleme (Issues)

- [ ] **QR-Codes:** Die generierten QR-Codes sind zwar mit den meisten Standard-Apps lesbar, funktionieren aber nicht unter bestimmten Implementierungen wie der **ZXing QR-Code Library** (und möglicherweise anderen Protokollen). Wir müssen prüfen, ob das am Format, am Kontrast oder an der Codierung liegt.
- [ ] **Accessibility (Login):** Die Input-Felder auf der Login-Seite benötigen explizite HTML-Labels für bessere Barrierefreiheit und Usability (PageSpeed/Accessibility Score).

## Setup-Formular Aufräumen (geplanter Umbau)

Der Server-seitige `heatLevel` ist bereits auf **5 Stufen** ausgelegt (`app/api/generate/route.ts` Z. 174–181: soft/romantic → flirty → kinky → intense → maximum). Der UI-Slider nutzt das bisher nicht voll aus, und das Setup-Formular enthält zwei Felder, die dadurch redundant bzw. funktionslos werden.

- [ ] **Heat-Level-Slider auf 5 Stufen bringen.** Aktuell exponiert das UI weniger Stufen als der Server versteht. Slider soll volle `1..5`-Auswahl zeigen, mit passenden Labels pro Stufe (die Beschreibungen existieren schon im Server-Code). Betroffen: `app/components/ClassicSetup.tsx` und `app/components/GameMasterSetup.tsx`.
- [ ] **Atmosphäre-Dropdown entfernen.** Wurde mit `feature/prompt-master-update` eingeführt, ist aber redundant sobald der Heat-Level 5 Stufen hat — die Bandbreite soft/flirty/kinky/intense/maximum deckt die tonalen Abstufungen bereits ab. Entfernen aus UI, State (`atmosphaere`-Variable in `app/page.tsx`), Supabase-Broadcast-Sync, `ClassicSetup.tsx`, `GameMasterSetup.tsx` und aus dem API-Request-Body + Server-Prompt in `app/api/generate/route.ts`.
- [ ] **Veils-Textfeld ersetzen durch "Special Wishes for Game Rules and Atmosphere".** Das Veils-Feld ist in der Praxis sinnlos (User verstehen nicht was sie eingeben sollen, wird nicht sinnvoll befüllt). Stattdessen ein Textfeld mit klarem Label: **"Special Wishes for Game Rules and Atmosphere"** (DE: "Besondere Wünsche für Spielregeln und Stimmung"). Ersetzt funktional das alte `veils`-Feld. Hard-Limits bleibt unangetastet. Betroffen: gleiche Dateien wie oben + `lib/translations.ts` für DE/EN-Labels.

**Abhängigkeiten:** Diese drei Änderungen hängen zusammen und sollten in einem zusammenhängenden Umbau passieren, damit das Setup-Formular konsistent bleibt.
