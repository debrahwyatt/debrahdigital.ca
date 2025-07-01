import { generateServiceEntries } from './serviceDataHelpers';
import AIToolsContent from '../components/services/AIToolsContent.astro';
import TrainingContent from '../components/services/TrainingContent.astro';
import OnsiteSupportContent from '../components/services/OnsiteSupportContent.astro';
import TechConsultingContent from '../components/services/TechConsultingContent.astro';
import ComputerRepairContent from '../components/services/ComputerRepairContent.astro';
import CustomSoftwareContent from '../components/services/CustomSoftwareContent.astro';
import WebsiteDevelopmentContent from '../components/services/WebsiteDevelopmentContent.astro';
import NetworkOptimizationContent from '../components/services/NetworkOptimizationContent.astro';

const flatServices = Object.fromEntries([
  ...generateServiceEntries({
    baseSlug: "computer-repair",
    component: ComputerRepairContent,
    baseTitle: "Computer Repair Services | Debrah's Digital Solutions",
    baseH1: "Computer Repair",
    baseSubheading: "Fast, Reliable Fixes — Right at Your Doorstep",
    seoKey: "computer-repair"
  }),
  ...generateServiceEntries({
    baseSlug: "network-optimization",
    component: NetworkOptimizationContent,
    baseTitle: "Network Optimization | Debrah's Digital Solutions",
    baseH1: "Network Optimization",
    baseSubheading: "Faster, More Reliable Wi-Fi for Work, Play, and Everything In Between",
    seoKey: "network-optimization"
  }),
  ...generateServiceEntries({
    baseSlug: "ai-automation",
    component: AIToolsContent,
    baseTitle: "AI Tools & Automation | Debrah's Digital Solutions",
    baseH1: "AI Tools & Automation",
    baseSubheading: "Boost Productivity with Smart, Custom Solutions",
    seoKey: "ai-automation"
  }),
  ...generateServiceEntries({
    baseSlug: "custom-software",
    component: CustomSoftwareContent,
    baseTitle: "Custom Software Solutions | Debrah's Digital Solutions",
    baseH1: "Custom Software",
    baseSubheading: "Software Tailored to Your Workflow and Goals",
    seoKey: "custom-software"
  }),
  ...generateServiceEntries({
    baseSlug: "onsite-tech-support",
    component: OnsiteSupportContent,
    baseTitle: "On-Site Tech Support | Debrah's Digital Solutions",
    baseH1: "On-Site Tech Support",
    baseSubheading: "Local Tech Help That Comes to You",
    seoKey: "onsite-tech-support"
  }),
  ...generateServiceEntries({
    baseSlug: "business-tech-consulting",
    component: TechConsultingContent,
    baseTitle: "Business Tech Consulting | Debrah's Digital Solutions",
    baseH1: "Business Tech Consulting",
    baseSubheading: "Smart Tech Advice That Moves Your Business Forward",
    seoKey: "business-tech-consulting"
  }),
  ...generateServiceEntries({
    baseSlug: "digital-skills-training",
    component: TrainingContent,
    baseTitle: "Digital Skills Training | Debrah's Digital Solutions",
    baseH1: "Digital Skills Training",
    baseSubheading: "Upskill your team with modern digital skills — ready-to-teach, professionally delivered.",
    seoKey: "digital-skills-training"
  }),
  ...generateServiceEntries({
    baseSlug: "website-development",
    component: WebsiteDevelopmentContent,
    baseTitle: "Website Development | Debrah's Digital Solutions",
    baseH1: "Website Development",
    baseSubheading: "Modern, Mobile-Friendly Websites Built for Local Business",
    seoKey: "website-development"
  })
]);

export const serviceData = flatServices;
export type ServiceSlug = keyof typeof serviceData;
