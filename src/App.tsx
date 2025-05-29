import './App.css';

import Footer from './Footer';
import Header from './Header';

import Home from './Home';
import About from './About';
import Error from './Error';
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
          <Route path="/Services" element={<Services />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Success" element={<Success />} />
          <Route path="/Error" element={<Error />} />
        </Routes>
        <Footer/>
      </main>
    </Router>
  );
};

export default App;
