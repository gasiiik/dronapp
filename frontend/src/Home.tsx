import { useEffect, useState } from 'react';

interface SensorData {
  timestamp: string;
  opticky_senzor: string;
  rychlost_vetru_ms: string;
  detektor_plynu_ppm: string;
  vlhkost_pudy_pct: string;
  teplota_c: string;
  vlhkost_vzduchu_pct: string;
}

export function Home() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Stavy pro kontrolu a instalaci AI
  const [aiStatus, setAiStatus] = useState<string>("checking");
  const [installing, setInstalling] = useState<boolean>(false);

  useEffect(() => {
    // Načtení dat ze senzorů
    fetch('http://localhost:8000/api/data')
      .then((response) => response.json())
      .then((data) => {
        setSensorData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Chyba při stahování dat:', error);
        setLoading(false);
      });

    // Kontrola, zda na PC běží Ollama
    verifikujStavAI();
  }, []);

  const verifikujStavAI = () => {
    fetch('http://localhost:8000/api/ai-status')
      .then((res) => res.json())
      .then((data) => setAiStatus(data.status))
      .catch(() => setAiStatus("missing"));
  };

  // Funkce, která pošle příkaz Pythonu k instalaci
  const spustitInstalaciAI = async () => {
    setInstalling(true);
    try {
      await fetch('http://localhost:8000/api/install-ollama', { method: 'POST' });
      alert("Python backend začal stahovat Ollamu. Za malou chvíli se ti na obrazovce otevře průvodce instalací Windows.");
    } catch (error) {
      alert("Nepodařilo se spustit instalátor přes backend.");
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Načítám data ze senzorů...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      
      {/* PANEL PRO INSTALACI AI */}
      <div style={{ 
        backgroundColor: aiStatus === 'ready' ? '#1e3a1e' : '#3a2e1e', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: aiStatus === 'ready' ? '1px solid #00ff66' : '1px solid #ffcc00'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}> Stavební modul lokální AI</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#ccc' }}>
            {aiStatus === 'checking' && 'Ověřuji dostupnost AI v systému...'}
            {aiStatus === 'ready' && 'Systém zaregistroval lokální model Ollama (Llama 3). Vše je připraveno.'}
            {aiStatus === 'missing' && 'Pozor: V tomto počítači chybí nebo neběží prostředí Ollama. Dashboard nebude schopen analyzovat rizika.'}
          </p>
        </div>

        {aiStatus === 'missing' && (
          <button
            onClick={spustitInstalaciAI}
            disabled={installing}
            style={{
              backgroundColor: '#ffcc00',
              color: 'black',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            {installing ? 'Stahování...' : '⚡ Instalovat AI do PC'}
          </button>
        )}
      </div>

      <h1>Přehled dat z Arduina</h1>
      <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#242424', color: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a1a' }}>
            <th>Čas měření</th>
            <th>Optický / IR senzor</th>
            <th>Rychlost větru (m/s)</th>
            <th>Plyn (ppm)</th>
            <th>Vlhkost půdy (%)</th>
            <th>Teplota (°C)</th>
            <th>Vlhkost vzduchu (%)</th>
          </tr>
        </thead>
        <tbody>
          {sensorData.map((row, index) => (
            <tr key={index}>
              <td>{row.timestamp}</td>
              <td>{row.opticky_senzor}</td>
              <td>{row.rychlost_vetru_ms}</td>
              <td>{row.detektor_plynu_ppm}</td>
              <td>{row.vlhkost_pudy_pct} %</td>
              <td>{row.teplota_c} °C</td>
              <td>{row.vlhkost_vzduchu_pct} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}