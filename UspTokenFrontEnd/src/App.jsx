import { Outlet } from "react-router-dom"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import './App.css'

function App() {

 
  return (
    <div className="container">
      <NavBar />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default App
