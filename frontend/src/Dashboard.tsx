import { useState, useEffect } from 'react';

// Definice struktury dat pro senzory
interface SensorData {
  timestamp: string;
  opticky_senzor: string;
  rychlost_vetru_ms: string;
  detektor_plynu_ppm: string;
  vlhkost_pudy_pct: string;
  teplota_c: string;
  vlhkost_vzduchu_pct: string;
}

export function Dashboard() {
  const [vybranaSonda, setVybranaSonda] = useState<number | null>(null);
  const [aktualniData, setAktualniData] = useState<SensorData | null>(null);
  const [aiOdpoved, setAiOdpoved] = useState<string>("");
  const [nacteniAi, setNacteniAi] = useState<boolean>(false);

  // Funkce pro načtení a analýzu dat po kliknutí na sondu
  const spravujKliknutiNaSondu = async (sondaId: number) => {
    setVybranaSonda(sondaId);
    setAiOdpoved("");
    setNacteniAi(true);
    setAktualniData(null);

    try {
      // 1. Krok: Stáhneme nejnovější data ze senzorů pro zobrazení na panelu
      const dataOdezva = await fetch('http://localhost:8000/api/data');
      const vsechnaData: SensorData[] = await dataOdezva.json();
      
      if (vsechnaData && vsechnaData.length > 0) {
        // Vezmeme poslední (nejaktuálnější) záznam z CSV
        setAktualniData(vsechnaData[vsechnaData.length - 1]);
      }

      // 2. Krok: Zavoláme AI agenta na backendu pro analýzu
      const aiOdezva = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sonda_id: sondaId })
      });
      
      const aiData = await aiOdezva.json();
      setAiOdpoved(aiData.analysis);

    } catch (error) {
      console.error("Chyba komunikace s backendem:", error);
      setAiOdpoved("Nepodařilo se spojit s Python backendem nebo AI modulem.");
    } finally {
      setNacteniAi(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 41px)', width: '100vw', backgroundColor: '#1a1a1a', color: 'white' }}>
      
      {/* LEVÁ ČÁST: Interaktivní mapa (Zatím vizuální placeholder pro Leaflet) */}
      <div style={{ flex: 2, backgroundColor: '#2d2d2d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid #333', position: 'relative' }}>
        <div style={{ textRendering: 'optimizeLegibility', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🗺️</div>
          <h2>Interaktivní mapa SOČ</h2>
          <p style={{ color: '#aaa', maxWidth: '400px', margin: '0 auto' }}>
            Zde bude vykreslena mapa. Po kliknutí na sondu vpravo se mapa vycentruje na její GPS souřadnice.
          </p>
        </div>

        {/* Grafický prvek simulující zaměření na mapě */}
        {vybranaSonda && (
          <div style={{ position: 'absolute', top: vybranaSonda === 1 ? '40%' : '50%', left: vybranaSonda === 1 ? '45%' : '55%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', animation: 'bounce 1s infinite' }}>📍</div>
            <span style={{ backgroundColor: '#00ffcc', color: 'black', padding: '2px 6px', borderRadius: '3px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Sonda {vybranaSonda === 1 ? 'Alfa' : 'Beta'}
            </span>
          </div>
        )}
      </div>

      {/* PRAVÁ ČÁST: Ovládací panel a AI rozhraní */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', backgroundColor: '#141414' }}>
        
        {/* Sekce 1: Výběr sondy */}
        <section>
          <h2 style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '10px' }}>Dostupné sondy dronu</h2>
          <div 
            onClick={() => spravujKliknutiNaSondu(1)}
            style={{ padding: '15px', margin: '8px 0', backgroundColor: vybranaSonda === 1 ? '#2a2a2a' : '#1d1d1d', borderRadius: '6px', cursor: 'pointer', border: vybranaSonda === 1 ? '1px solid #00ffcc' : '1px solid #333', transition: '0.2s' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>🛰️ Sonda Alfa</strong>
              <span style={{ color: '#00ffcc', fontSize: '0.8rem' }}>50.083° N, 14.435° E</span>
            </div>
          </div>
          <div 
            onClick={() => spravujKliknutiNaSondu(2)}
            style={{ padding: '15px', margin: '8px 0', backgroundColor: vybranaSonda === 2 ? '#2a2a2a' : '#1d1d1d', borderRadius: '6px', cursor: 'pointer', border: vybranaSonda === 2 ? '1px solid #00ffcc' : '1px solid #333', transition: '0.2s' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>🛰️ Sonda Beta</strong>
              <span style={{ color: '#00ffcc', fontSize: '0.8rem' }}>50.091° N, 14.452° E</span>
            </div>
          </div>
        </section>

        {/* Sekce 2: Telemetrie ze senzorů (Zobrazí se až po kliknutí) */}
        {vybranaSonda && aktualniData && (
          <section style={{ backgroundColor: '#1d1d1d', padding: '15px', borderRadius: '6px', border: '1px solid #333' }}>
            <h3 style={{ fontSize: '1rem', color: '#00ffcc', marginTop: 0, marginBottom: '10px' }}>📊 Aktuální telemetrie</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
              <div>🌡️ Teplota: <strong>{aktualniData.teplota_c} °C</strong></div>
              <div>💧 Vlhkost vzduchu: <strong>{aktualniData.vlhkost_vzduchu_pct} %</strong></div>
              <div>💨 Vítr: <strong>{aktualniData.rychlost_vetru_ms} m/s</strong></div>
              <div>⚠️ Plyn: <strong>{aktualniData.detektor_plynu_ppm} ppm</strong></div>
              <div>🌱 Vlhkost půdy: <strong>{aktualniData.vlhkost_pudy_pct} %</strong></div>
              <div>👁️ IR Senzor: <strong>{aktualniData.opticky_senzor}</strong></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '10px', textAlign: 'right' }}>
              Čas zápisu: {aktualniData.timestamp}
            </div>
          </section>
        )}

        <hr style={{ borderColor: '#222', width: '100%', margin: '5px 0' }} />

        {/* Sekce 3: Výstup z Lokální AI */}
        <section>
          <h2 style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '10px' }}>🧠 Autonomní AI Analýza</h2>
          
          {vybranaSonda ? (
            <div style={{ backgroundColor: '#0d0d0d', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #00ffcc', minHeight: '120px' }}>
              
              {nacteniAi ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ color: '#00ffcc', fontStyle: 'italic', margin: 0 }}>
                    Nahrávám data do lokálního LLM modelu...
                  </p>
                  <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>
                    (Ollama analyzuje plyn, vítr a teplotní indexy)
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>Model: Llama 3 (Lokální)</span>
                    <span style={{ color: '#00ffcc', fontSize: '0.75rem' }}>● Status: Vyhodnoceno</span>
                  </div>
                  <p style={{ lineHeight: '1.6', margin: 0, fontSize: '0.95rem', color: '#e0e0e0' }}>
                    {aiOdpoved}
                  </p>
                </>
              )}

            </div>
          ) : (
            <p style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
              Vyber sondu ze seznamu pro zobrazení dat a spuštění AI analýzy rizik.
            </p>
          )}
        </section>
        
      </div>
    </div>
  );
}