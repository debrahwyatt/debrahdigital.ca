function generateStructuredData(serviceType: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    description
  };
}

export const serviceSEO = {
  "computer-repair": {
    metaDescription: "Get reliable and affordable computer repair services in Fairview and surrounding areas. We fix desktops, laptops, and offer upgrades and virus removal.",
    keywords: [
      "computer repair Fairview",
      "laptop repair",
      "PC repair",
      "virus removal Fairview",
      "local tech support",
      "Debrah's Digital Solutions",
      "desktop troubleshooting",
      "computer upgrades",
      "computer cleaning"
    ],
    ogImage: "/images/services/computer-repair-og.webp",
    structuredData: generateStructuredData("Computer Repair", "We provide local computer repair services, including laptop fixes, desktop upgrades, virus removal, and custom builds. Fast and friendly support at your door.")
  },

  "phone-tablet-repair": {
    metaDescription: "Professional phone and tablet repair services in Fairview. We fix cracked screens, replace batteries, repair charging ports, and restore iPhones, iPads, and Android devices quickly and affordably.",
    keywords: [
      "phone repair Fairview",
      "tablet repair Fairview",
      "iPhone screen replacement",
      "Android repair",
      "iPad repair",
      "phone battery replacement",
      "tablet charging port repair",
      "Debrah's Digital Solutions",
      "mobile device repair Fairview"
    ],
    ogImage: "/images/services/phone-tablet-repair-og.webp",
    structuredData: generateStructuredData(
      "Phone & Tablet Repair",
      "We provide reliable phone and tablet repair services in Fairview, including screen replacements, battery swaps, charging port fixes, water damage treatment, and software support for iPhones, iPads, and Android devices."
    )
  },

  "network-optimization": {
    metaDescription: "Speed up your Wi-Fi and fix connection issues with local network optimization in Fairview and surrounding areas. We improve home and business networks for reliability and speed.",
    keywords: [
      "network optimization Fairview",
      "Wi-Fi setup Fairview",
      "router configuration",
      "home networking support",
      "wireless signal boost",
      "internet troubleshooting",
      "Debrah's Digital Solutions",
      "mesh network setup",
      "rural internet help"
    ],
    ogImage: "/images/services/network-optimization-og.webp",
    structuredData: generateStructuredData("Network Optimization", "We improve slow or unreliable internet connections with Wi-Fi tuning, router setup, mesh system installation, and general network cleanup for homes, farms, and businesses.")
  },

  "ai-automation": {
    metaDescription: "Streamline operations and save time with AI tools and automation tailored for local Alberta businesses. Get smart systems that actually work for your workflow.",
    keywords: [
      "AI automation Alberta",
      "business automation tools",
      "workflow automation Fairview",
      "ChatGPT business solutions",
      "Zapier automation Alberta",
      "Debrah's Digital Solutions",
      "automated processes",
      "AI consulting Peace River",
      "AI tools for small business"
    ],
    ogImage: "/images/services/ai-tools-og.webp",
    structuredData: generateStructuredData("AI Tools & Automation", "We help automate repetitive tasks, implement AI-based systems, and improve productivity for rural Alberta businesses using tools like ChatGPT, Zapier, and custom scripting.")
  },

  "custom-software": {
    metaDescription: "Build custom software designed for your business workflow. From automation scripts to full apps, Debrah's Digital Solutions delivers practical tools for small business success.",
    keywords: [
      "custom software Alberta",
      "business software solutions",
      "workflow automation apps",
      "software for small business",
      "Debrah's Digital Solutions",
      "Fairview custom tech",
      "Python automation Alberta",
      "custom CRM",
      "database apps Fairview"
    ],
    ogImage: "/images/services/custom-software-og.webp",
    structuredData: generateStructuredData("Custom Software Development", "We build custom software tailored to your business process — whether it’s automation scripts, internal tools, data entry apps, or integrations. Serving rural Alberta businesses and farms.")
  },

  "onsite-tech-support": {
    metaDescription: "Need tech support at home or the office? We come to you. Serving Fairview and surrounding rural Alberta with friendly on-site computer, internet, and device help.",
    keywords: [
      "on-site tech support",
      "home tech repair Fairview",
      "mobile computer services",
      "in-home tech help Alberta",
      "Debrah's Digital Solutions",
      "Wi-Fi setup Fairview",
      "tech setup rural Alberta",
      "printer and router installation",
      "Fairview IT technician"
    ],
    ogImage: "/images/services/onsite-support-og.webp",
    structuredData: generateStructuredData("On-Site Tech Support", "On-site tech support for computers, internet, smart devices, and peripherals. Serving homes, farms, and small businesses with convenient in-person service.")
  },

  "business-tech-consulting": {
    metaDescription: "Get expert tech advice for your business. We help you choose the right tools, cut IT costs, improve cybersecurity, and streamline workflows in Alberta.",
    keywords: [
      "business tech consulting",
      "IT advisor Alberta",
      "Fairview tech strategy",
      "small business IT help",
      "cybersecurity consulting",
      "cloud software planning",
      "Debrah's Digital Solutions",
      "workflow automation",
      "tech audits Alberta",
      "digital strategy expert"
    ],
    ogImage: "/images/services/tech-consulting-og.webp",
    structuredData: generateStructuredData("Business Tech Consulting", "We advise businesses on software choices, cybersecurity best practices, tech budgeting, automation tools, and strategic IT planning.")
  },

  "digital-skills-training": {
    metaDescription: "Affordable digital skills training for teams, adults, and seniors in Alberta. Courses include cybersecurity, AI tools, workplace software, and custom topics.",
    keywords: [
      "digital skills training",
      "computer courses Alberta",
      "tech training Fairview",
      "cybersecurity workshops",
      "AI training Alberta",
      "business computer skills",
      "senior computer classes",
      "workplace software training",
      "Debrah's Digital Solutions",
      "custom tech workshops"
    ],
    ogImage: "/images/services/training-og.webp",
    structuredData: generateStructuredData("Digital Skills Training", "We offer digital skills training for businesses, seniors, and individuals. Learn cybersecurity, cloud tools, AI productivity, and more — on-site or virtually.")
  },

  "website-development": {
    metaDescription: "Mobile-friendly, fast-loading websites designed for small businesses and organizations in Alberta. Affordable, SEO-optimized builds with ongoing support.",
    keywords: [
      "website development Fairview",
      "web design Alberta",
      "business website builder",
      "SEO website services",
      "small business websites",
      "mobile friendly websites",
      "Debrah's Digital Solutions",
      "custom website design",
      "affordable website builder"
    ],
    ogImage: "/images/services/website-development-og.webp",
    structuredData: generateStructuredData("Website Development", "We create websites that are fast, responsive, and SEO-friendly for local businesses across northern Alberta. Great for service providers, farms, and rural businesses.")
  }
} as const;
