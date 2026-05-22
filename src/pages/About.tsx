import '../styles/about.css'
import SEO from '../components/SEO'

function About() {
  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | About"
        description="Learn more about Debrah Wyatt, Business Owner & Technology Consultant with a Bachelor of Software Engineering and Specialization in Artificial Intelligence from the University of Victoria."
        path="/about"
      />

      <div className="page-wrapper about-page">
        <div className="page-header about-header">
          <h1>About Us</h1>

          <p>
            Tech made simple, right at your doorstep
          </p>
        </div>

        <div className="about-content">
          <div className="mission-statement page-text">
            <h2>Our Mission</h2>

            <p>
              At Debrah&apos;s Digital Solutions, our mission is to
              make technology simple, accessible, and empowering
              for everyone in our community. We provide expert
              computer repair, personalized training, and
              innovative digital services tailored to the unique
              needs of individuals, families, and businesses in
              Fairview and beyond. Through honest guidance,
              hands-on support, and a welcoming environment, we
              aim to bridge the gap between people and technology
              — helping our clients succeed, connect, and grow in
              a digital world.
            </p>
          </div>

          <div className="value-statement page-text">
            <h2>Our Vision</h2>

            <p>
              To become the trusted technology hub for Fairview
              and the Peace Region — where individuals, families,
              and businesses turn for innovative solutions,
              personalized support, and a seamless digital
              experience. We envision a connected, empowered
              community where technology works for people, not the
              other way around.
            </p>
          </div>

          <div className="page-text about-text">
            <h2>Who Am I?</h2>

            <p>
              <strong>Debrah Wyatt</strong> — Business Owner &amp;
              Technology Consultant, founder of
              <span className="highlight">
                {' '}
                Debrah&apos;s Digital Solutions
              </span>
              , with a Bachelor of Software Engineering and a
              Specialization in Artificial Intelligence from the
              University of Victoria.
            </p>

            <p>
              With over 20 years of experience in technology, I
              help individuals and businesses in Fairview and
              surrounding areas simplify their digital needs.
              From computer repair and network optimization to
              modern websites, automation, and custom software
              solutions, I bring practical, real-world tech
              expertise with a personal touch.
            </p>

            <p>
              Let&apos;s make your{' '}
              <span className="highlight">
                tech simple, efficient, and tailored to your
                needs.
              </span>
            </p>
          </div>

          <div className="about-image">
            <img
              src="/debrah.webp"
              srcSet="/debrah_395x420.webp 2x"
              alt="Debrah Wyatt"
              width="263"
              height="280"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default About