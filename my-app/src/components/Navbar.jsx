// src/components/Navbar.js
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/films" 
            className={({ isActive }) => 
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Films
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/customers" 
            className={({ isActive }) => 
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Customers
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}