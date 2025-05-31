import './App.css';

import Home from './Home';
import About from './About';
import Error from './Error';
import Header from './Header';
import Footer from './Footer';
import Success from './Success';
import Contact from './Contact';
import Services from './Services';
import ScrollToTop from "./ScrollToTop";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


const App: React.FC = () => {

  return (
    <Router>
      <ScrollToTop />
        <Header/>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/About" element={<About />} />
            <Route path="/Error" element={<Error />} />
            <Route path="/Success" element={<Success />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Services" element={<Services />} />
          </Routes>
        </main>
      <Footer/>
    </Router>
  );
};

export default App;
