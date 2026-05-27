import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './Home';
import { Dashboard } from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Horní navigační lišta, která bude vidět na každé stránce */}
      <nav style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '10px 20px', 
        display: 'flex', 
        gap: '20px', 
        borderBottom: '1px solid #333' 
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          📊 Tabulka dat
        </Link>
        <Link to="/dashboard" style={{ color: '#00ffcc', textDecoration: 'none', fontWeight: 'bold' }}>
          🗺️ Dashboard (Mapa & AI)
        </Link>
      </nav>

      {/* Definice stránek – podle URL se vybere správný soubor */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;