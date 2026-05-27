from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import ollama
import os
import subprocess
import threading
import requests

app = FastAPI()

# Povolení CORS pro komunikaci s TypeScript frontendem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # V produkci nahraď konkrétní adresou frontendu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definice struktury požadavku, který přijde z frontendu
class ProbeRequest(BaseModel):
    sonda_id: int

@app.get("/api/data")
def get_sensor_data():
    """
    Endpoint, který načte kompletní historii měření z CSV souboru
    a odešle ji na frontend pro zobrazení v tabulce.
    """
    data = []
    try:
        with open('data.csv', mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                data.append(row)
        return data
    except FileNotFoundError:
        return {"error": "Soubor data.csv nebyl nalezen. Ujisti se, že leží ve stejné složce jako main.py."}
    except Exception as e:
        return {"error": f"Chyba při čtení CSV: {str(e)}"}

@app.get("/api/ai-status")
def get_ai_status():
    """
    Endpoint pro kontrolu, zda prostředí Ollama v počítači běží a komunikuje.
    """
    try:
        ollama.list()
        return {"status": "ready", "message": "Lokální AI je nainstalována a spuštěna."}
    except Exception:
        return {"status": "missing", "message": "Ollama není spuštěna nebo nainstalována."}

def download_and_run_ollama():
    """
    Pomocná funkce, která stáhne instalátor Ollamy pro Windows 
    do dočasné složky a spustí ho.
    """
    try:
        url = "https://ollama.com/download/OllamaSetup.exe"
        installer_path = os.path.join(os.environ.get("TEMP", "C:\\tmp"), "OllamaSetup.exe")
        
        # Stahování souboru
        response = requests.get(url, stream=True)
        with open(installer_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Spuštění instalátoru v OS Windows
        subprocess.Popen([installer_path], shell=True)
    except Exception as e:
        print(f"Chyba při automatické instalaci: {e}")

@app.post("/api/install-ollama")
def trigger_installation():
    """
    Endpoint, který spustí stahování a instalaci v samostatném vlákně,
    aby neblokoval běh samotné webové aplikace.
    """
    threading.Thread(target=download_and_run_ollama).start()
    return {"status": "started", "message": "Instalace byla spuštěna na pozadí."}

@app.post("/api/analyze")
def analyze_probe_data(req: ProbeRequest):
    """
    Endpoint, který vezme nejnovější data z CSV, sestaví z nich prompt
    a nechá je vyhodnotit lokálním AI modelem Llama 3.
    """
    latest_data = {}
    try:
        # Načteme poslední řádek z CSV, který představuje aktuální stav
        with open('data.csv', mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                latest_data = row
    except Exception as e:
        return {"analysis": f"Chyba při čtení senzorových dat pro AI: {str(e)}"}

    if not latest_data:
        return {"analysis": "V souboru data.csv nejsou žádné záznamy k analýze."}

    # Sestavení instrukcí pro lokálního AI agenta
    prompt = f"""
    Jsi specializovaný bezpečnostní AI agent pro vyhodnocování telemetrie z dronů a environmentálních sond.
    Analyzuj tato aktuální data ze sondy číslo {req.sonda_id}:
    
    - Čas měření: {latest_data.get('timestamp', 'N/A')}
    - Teplota vzduchu: {latest_data.get('teplota_c', 'N/A')} °C
    - Vlhkost vzduchu: {latest_data.get('vlhkost_vzduchu_pct', 'N/A')} %
    - Koncentrace plynů: {latest_data.get('detektor_plynu_ppm', 'N/A')} ppm
    - Rychlost větru: {latest_data.get('rychlost_vetru_ms', 'N/A')} m/s
    - Vlhkost půdy: {latest_data.get('vlhkost_pudy_pct', 'N/A')} %
    - Optický/IR senzor (intenzita světla/plamene): {latest_data.get('opticky_senzor', 'N/A')}
    
    Úkol: Vygeneruj stručné, ale odborné vyhodnocení rizik v češtině (maximálně 3 až 4 věty). 
    Pokud jsou hodnoty v normě, potvrď to. Pokud detekuješ anomálii (např. vysoký plyn, silný vítr nebo kritické hodnoty IR senzoru), 
    důrazně na to upozorni a navrhni okamžité opatření pro operátora dronu.
    """

    try:
        # Volání lokálního AI modelu pomocí oficiální knihovny ollama
        response = ollama.generate(
            model='llama3',
            prompt=prompt,
            options={
                "temperature": 0.3,  # Nižší teplota zajistí stabilnější a méně vymyšlené odpovědi
            }
        )
        
        # Vrátíme vygenerovaný text zpět na frontend
        return {"analysis": response['response']}
        
    except Exception as e:
        return {
            "analysis": f"Chyba AI modulu. Ujisti se, že ti na pozadí běží aplikace Ollama a máš stažený model (příkaz: ollama run llama3). Detaily: {str(e)}"
        }