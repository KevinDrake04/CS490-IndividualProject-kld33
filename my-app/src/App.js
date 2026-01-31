// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Films from './components/Films';
import Customers from './components/Customers';
import './App.css';

function App() {

  const [data, setData] = useState([{}])

  useEffect(() => {
    fetch("/members").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/films" element={<Films />} />
          <Route path="/customers" element={<Customers />} />
          
          {/* Optional: catch-all for 404 */}
          <Route path="*" element={
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <p>Try going back to <a href="/">Home</a></p>
            </div>
          } />
        </Routes>
          
        {(typeof data.members === 'undefined') ? (
          <p>...</p>
        ): (
          data.members.map((member, i)=>(
            <p key={i}>{member}</p>
          ))
        )}
        
      </div>
    </BrowserRouter>
  );
}

export default App;