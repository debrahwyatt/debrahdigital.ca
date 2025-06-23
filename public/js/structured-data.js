const script = document.createElement("script");
script.type = "application/ld+json";
script.textContent = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.debrahdigital.ca#business",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.debrahdigital.ca"
  },
  "founder": {
    "@type": "Person",
    "name": "Debrah Wyatt"
  },
  "currenciesAccepted": "CAD",
  "paymentAccepted": "Cash, E-Transfer, Check",
  "name": "Debrah's Digital Solutions",
  "image": "https://www.debrahdigital.ca/ogImage.png",
  "description": "Fast, friendly, on-site computer repair, IT support, and digital training for homes, farms, and small businesses in Fairview, Alberta.",
  "url": "https://www.debrahdigital.ca",
  "telephone": "+1-780-330-9965",
  "email": "info@debrahdigital.ca",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "PO Box 2589",
    "addressLocality": "Fairview",
    "addressRegion": "AB",
    "postalCode": "T0H 1L0",
    "addressCountry": "CA"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 56.0705,
    "longitude": -118.3874
  },
  "openingHours": "Mo-Fr 09:00-17:00",
  "priceRange": "$$",
  "areaServed": {
    "@type": "Place",
    "name": "Fairview, Alberta and surrounding areas"
  },
  "sameAs": [
    "https://www.facebook.com/people/Debrahs-Digital-Solutions/61577075683150/",
    "https://www.linkedin.com/company/debrah-s-digital-solutions/"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Service Catalog",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Computer Repair",
          "description": "Diagnostics, hardware fixes, software cleanup, and virus removal for desktops and laptops."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Digital Skills Training",
          "description": "Personalized one-on-one or group training for basic computer skills, seniors, and job seekers."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "On-Site Support",
          "description": "Local tech support at your location — perfect for homes, farms, and businesses in and around Fairview."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Network Optimization",
          "description": "Wired and wireless network setup, troubleshooting, and speed improvements."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Website Development",
          "description": "Responsive, user-friendly websites tailored for small business and local organizations."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Business Tech Consulting",
          "description": "Helping businesses streamline operations with tech planning, software advice, and automation."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "AI Tools & Automation",
          "description": "Custom automations and AI-driven tools to save time and improve workflows."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Software Solutions",
          "description": "Bespoke software development for specialized needs, business processes, and integrations."
        }
      }
    ]
  }
});
document.head.appendChild(script);
