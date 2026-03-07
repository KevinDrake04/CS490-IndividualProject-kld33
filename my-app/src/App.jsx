import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "./features/navbar/navbar"

import Home from "./pages/Home"
import Films from "./pages/Films"
import Customers from "./pages/Customers"

import "./App.css"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/films" element={<Films />} />
        <Route path="/customers" element={<Customers />} />

        <Route
          path="*"
          element={
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <h1>404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>

      <Toaster position="top-center" />
    </BrowserRouter>
  )
}