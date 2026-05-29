import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Services from './pages/Services'
import Success from './pages/Success'
import Error from './pages/Error'
import Shop from './pages/Shop'
import Catalog from './pages/Catalog'

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/success" element={<Success />} />
        <Route path="/error" element={<Error />} />
        <Route path="/shop" element={<Shop />} />        
        <Route path="/catalog" element={<Catalog />} />        
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App