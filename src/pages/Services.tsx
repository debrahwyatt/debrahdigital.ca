import '../styles/services.css'
import SEO from '../components/SEO'

const services = [
  {
    title: 'Computer Repair Services',
    description:
      'Fast, reliable repairs for desktops, laptops, and computer accessories—done right the first time.',
    href: '/computer-repair',
    image: '/icon-repair.webp',
  },
  {
    title: 'Phone & Tablet Repair',
    description:
      'Screen replacements, battery swaps, charging port fixes, and more for iPhones, iPads, and Android devices.',
    href: '/phone-repair',
    image: '/icon-phone-tablet.webp',
  },
  {
    title: 'Digital Skills Training',
    description:
      'Learn essential tech skills through personalized instruction designed for real-world needs.',
    href: '/digital-skills',
    image: '/icon-training.webp',
  },
  {
    title: 'Website Development',
    description:
      'Modern, mobile-friendly websites built to showcase your brand and engage your customers.',
    href: '/websites',
    image: '/icon-web.webp',
  },
  {
    title: 'On-Site Support',
    description:
      'We come to your home or business for setup, troubleshooting, and hands-on tech help.',
    href: '/onsite-support',
    image: '/icon-onsite.webp',
  },
  {
    title: 'Custom Software Solutions',
    description:
      'Tailor-made software built from scratch to fit your exact processes and business needs.',
    href: '/custom-software',
    image: '/icon-software.webp',
  },
  {
    title: 'Business Tech Consulting',
    description:
      'Get expert guidance to streamline operations and align your tech with business goals.',
    href: '/tech-consulting',
    image: '/icon-consulting.webp',
  },
  {
    title: 'Network Optimization',
    description:
      'Boost your internet speed, improve Wi-Fi coverage, and secure your entire network system.',
    href: '/networks',
    image: '/icon-networking.webp',
  },
]

function Services() {
  return (
    <>
      <SEO
        title="Debrah's Digital Solutions | Services"
        description="Professional computer repair, website development, networking, digital skills training, and technology consulting in Fairview, Alberta."
        path="/services"
      />

      <div className="page-wrapper services-page">
        <div className="page-header services-header">
          <h1>Services</h1>

          <p>
            Tailored Tech Solutions for Your Needs
          </p>
        </div>

        <section className="services-grid">
          {services.map((service) => (
            <div
              className="service-card"
              key={service.title}
            >
              <img
                src={service.image}
                alt={service.title}
                width="64"
                height="64"
              />

              <h2>{service.title}</h2>

              <p>{service.description}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

export default Services