import { Button } from "@/components/ui/button"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Films from './pages/Films';
import Customers from './pages/Customers';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Button>Click me</Button>
        
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/films" element={<Films />} />
          <Route path="/customers" element={<Customers />} />
          
          {/* catch 404 */}
          <Route path="*" element={
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <p>Try going back to <a href="/">Home</a></p>
            </div>
          } />
        </Routes>            
      </div>
    </BrowserRouter>
  );
}

export default App;