import './App.css';

import Footer from './Footer';
import Header from './Header';

import Home from './Home';
import About from './About';
import Thanks from './Thanks';
import Contact from './Contact';
import Services from './Services';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


const App: React.FC = () => {

  return (
    <Router>
      <Header/>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Services" element={<Services />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Thanks" element={<Thanks />} />
        </Routes>
        <Footer/>
      </main>
    </Router>
  );
};

export default App;
