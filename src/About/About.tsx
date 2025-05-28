import './About.css';

const About: React.FC = () => {

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Us</h1>
        <p>Tech made simple, right at your doorstep</p>
      </div>
      <div className="about-content">
        <div className="about-text">
          <p>
            Hi, I’m <strong>Debrah Wyatt</strong> — a software engineer-in-training, automation specialist and founder of 
            <span className="highlight"> Debrah’s Digital Solutions</span>.
          </p>
          <p>
            With over 20 years of experience in tech, I help individuals and businesses in Fairview and surrounding 
            areas simplify their digital needs. From streamlining operations with smart automation to building clean, 
            responsive websites, I bring a human touch to modern tech.
          </p>
          <p>
            Let’s make your <span className="highlight">tech simple, efficient, and tailored to your needs.</span>
          </p>
        </div>
        <div className="about-image">
          <img src="../assets/debrah.webp" alt="Debrah Portrait" />
        </div>
      </div>
    </div>
  );
};

export default About;
