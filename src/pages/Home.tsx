import '../styles/home.css'
import { useRef } from 'react'
import SEO from '../components/SEO'

const homeSections = [
  {
    title: 'For Homes',
    services: [
      [
        'Computer & Device Repair',
        'Fast, reliable repairs for desktops, laptops, and computer accessories—done right the first time.',
        '/computer-repair',
        '/icon-repair.webp',
      ],

      [
        'Wifi & Network Issues',
        'Boost your internet speed, improve Wi-Fi coverage, and secure your entire network system.',
        '/networks',
        '/icon-networking.webp',
      ],

      [
        'New Device Setup & Data Transfer',
        'Screen replacements, battery swaps, charging port fixes, and more for iPhones, iPads, and Android devices.',
        '/onsite-support',
        '/icon-onsite.webp',
      ],
    ],
  },

  {
    title: 'For Small Businesses',

    services: [
      [
        'On-Site & Remote IT Support',
        'We come to your home or business for setup, troubleshooting, and hands-on tech help.',
        '/onsite-support',
        '/icon-onsite.webp',
      ],

      [
        'Network Optimization',
        'Boost your internet speed, improve Wi-Fi coverage, and secure your entire network system.',
        '/networks',
        '/icon-networking.webp',
      ],

      [
        'Security & Backup',
        'Get expert guidance to streamline operations and align your tech with business goals.',
        '/tech-consulting',
        '/icon-consulting.webp',
      ],
    ],
  },

  {
    title: 'Specialized Work',

    services: [
      [
        'Digital Skills Training',
        'Learn essential tech skills through personalized instruction designed for real-world needs.',
        '/digital-skills',
        '/icon-training.webp',
      ],

      [
        'Website Development',
        'Modern, mobile-friendly websites built to showcase your brand and engage your customers.',
        '/websites',
        '/icon-web.webp',
      ],

      [
        'Custom Software & Automation',
        'Tailor-made software built from scratch to fit your exact processes and business needs.',
        '/custom-software',
        '/icon-software.webp',
      ],
    ],
  },
]

function Home() {
  const rotationRef = useRef(0)
  const speedRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const isAnimatingRef = useRef(false)

  const handleLogoClick = (
    event: React.MouseEvent<HTMLImageElement>,
  ) => {
    if (event.button !== 0) return

    const logo = event.currentTarget
    const rect = logo.getBoundingClientRect()
    const midpoint = rect.left + rect.width / 2

    speedRef.current +=
      event.clientX >= midpoint ? 0.4 : -0.4

    speedRef.current = Math.max(
      Math.min(speedRef.current, 1),
      -1,
    )

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current
      lastTimeRef.current = time

      if (Math.abs(speedRef.current) > 0.001) {
        rotationRef.current +=
          speedRef.current * delta

        const decayStep = 0.000074 * delta

        speedRef.current -=
          Math.sign(speedRef.current) *
          Math.min(
            Math.abs(speedRef.current),
            decayStep,
          )

        logo.style.transform = `rotateY(${rotationRef.current}deg)`

        requestAnimationFrame(animate)
      } else {
        speedRef.current = 0
        isAnimatingRef.current = false
      }
    }

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true
      lastTimeRef.current = performance.now()
      requestAnimationFrame(animate)
    }
  }

  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Computer Repair & IT Services in Fairview"
        description="Debrah's Digital Solutions provides computer repair, networking, websites, technology consulting, and IT support for homes and businesses in Fairview, Alberta."
        path="/"
      />

      <div className="page-wrapper">
        <h1 className="sr-only">
          Debrah&apos;s Digital Solutions - Tech Help in
          Fairview, Alberta
        </h1>

        <section className="hero-section">
          <div className="hero-inner">
            <div className="hero-text">
              <h1>
                Tech Problems Solved -{' '}
                <span className="highlight">
                  without the runaround.
                </span>
              </h1>

              <p>
                Professional computer, network, and
                business tech support for homes and
                small businesses in Fairview.
              </p>

              <div className="hero-buttons">
                <a
                  href="/contact"
                  className="btn"
                >
                  Get Tech Help
                </a>
              </div>
            </div>

            <div className="hero-image">
              <div id="logo-spinner">
                <img
                  id="logo"
                  className="ai-head"
                  src="/logo_web.webp"
                  srcSet="/logo_web_375x375.webp 2x"
                  alt="Debrah's Digital Solutions Logo"
                  width="250"
                  height="250"
                  onMouseDown={handleLogoClick}
                />
              </div>
            </div>
          </div>
        </section>

        {homeSections.map((section) => (
          <section
            className="services-section"
            key={section.title}
          >
            <h2>{section.title}</h2>

            <div className="services-grid">
              {section.services.map(
                ([
                  title,
                  description,
                  _href,
                  img,
                ]) => (
                  <div
                    className="service-item"
                    key={title}
                  >
                    <img
                      src={img}
                      alt=""
                      width="64"
                      height="64"
                    />

                    <h3>{title}</h3>

                    <p>{description}</p>
                  </div>
                ),
              )}
            </div>
          </section>
        ))}

        <section className="info-section">
          <div className="info-inner">
            <div className="info-img">
              <img
                src="/Client-Focused.png"
                alt="Client-focused technology support"
              />
            </div>

            <div className="info-text">
              <h2>
                Client-Focused Solutions
              </h2>

              <p>
                Need help with a computer,
                website, or system upgrade?
                <br />
                <br />
                I provide on-site visits, remote
                assistance, and tailored
                solutions built to match your
                needs.
              </p>

              <ul className="checklist">
                <li>Fast Response</li>
                <li>Clear Communication</li>
                <li>
                  Affordable, Professional
                </li>
              </ul>

              <a
                href="/services"
                className="btn info-btn"
              >
                Learn More About Our Services
              </a>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="info-inner">
            <div className="info-text">
              <h2>About Debrah</h2>

              <h4>Debrah Wyatt</h4>

              <p>
                Business Owner &amp; Technology
                Consultant
                <br />
                <br />
                Specialization in Artificial
                Intelligence
                <br />
                Bachelor of Software Engineering,
                UVic
                <br />
                20+ years experience in tech
                &amp; automation
              </p>

              <br />

              <em>
                “Tech made simple, right at your
                doorstep.”
              </em>

              <br />

              <a
                href="/about"
                className="btn info-btn"
              >
                More About Us
              </a>
            </div>

            <div className="info-text full-width">
              <h2>
                Contact or Book Now
              </h2>

              <p>
                Ready to simplify your tech?
                Let&apos;s talk.
              </p>

              <a
                href="/contact"
                className="btn info-btn"
              >
                Contact or Book Now
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home