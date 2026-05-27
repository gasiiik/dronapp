# SOČ Dron - Vizualizace dat ze senzorů s lokální AI

Tento projekt vznikl v rámci Středoškolské odborné činnosti (SOČ). Slouží k přehledné vizualizaci telemetrických dat ze záchranných a environmentálních sond připevněných na průzkumném dronu. 

Data jsou čtena ze souboru `.csv` (který simuluje automatický zápis z Arduina každých 5 minut), zobrazována na interaktivní open-source mapě a následně analyzována pomocí lokální umělé inteligence pro autonomní vyhodnocení rizik a anomálií v reálném čase.

## 🚀 Hlavní funkce
* **Interaktivní open-source mapa:** Zobrazení přesné polohy sond na podkladech OpenStreetMap (pomocí knihovny Leaflet). Při přepínání sond se mapa plynule centruje na GPS souřadnice daného zařízení.
* **Telemetrie ze senzorů:** Přehledné zobrazení aktuálních hodnot: teplota vzduchu, vlhkost vzduchu, rychlost větru, koncentrace plynů (ppm), vlhkost půdy a optický/IR senzor (intenzita světla/plamene).
* **Autonomní AI Analýza:** Lokální velký jazykový model (LLM) analyzuje anomálie (např. úniky plynů, kritický vítr) a generuje operátorovi stručné bezpečnostní reporty a varování.
* **Integrovaný instalátor AI:** Pokud v počítači chybí prostředí pro spuštění umělé inteligence, aplikace nabízí možnost stáhnout a spustit instalátor automaticky na jedno kliknutí přímo z webového rozhraní.

## 🛠️ Použité technologie
* **Backend:** Python 3 (FastAPI, Uvicorn server, Ollama Python SDK)
* **Frontend:** TypeScript, React.js (Vite, React Router pro směrování, React Leaflet pro mapy)
* **AI Modul:** Ollama (lokální model Llama 3)

---

## 📦 Instalace a spuštění

Pro správný běh aplikace je nutné mít v počítači nainstalované prostředí **Node.js** (pro frontend) a **Python 3** (pro backend).

### 1. Příprava lokální AI (Ollama)
Aplikace využívá pro analýzy model **Llama 3** běžící kompletně offline na tvém hardwaru.

* **Možnost A (Ruční příprava):**
  1. Stáhni a nainstaluj aplikaci z oficiálního webu [ollama.com](https://ollama.com/).
  2. Otevři příkazový řádek (PowerShell) a stáhni/spusť model příkazem:
     ```powershell
     ollama run llama3
     ```
* **Možnost B (Automaticky přes aplikaci):**
  Pokud Ollamu nemáš, aplikace tě na úvodní stránce upozorní oranžovým panelem. Kliknutím na tlačítko `Instalovat AI do PC` backend sám stáhne oficiální instalátor pro Windows a spustí ho na pozadí.

### 2. Spuštění Python Backenduv
1. Otevři terminál a přejdi do složky `backend`:
   ```powershell
   cd backend
