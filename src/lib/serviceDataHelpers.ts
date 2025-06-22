import * as sharedSEO from './seoData';
import { serviceCities } from './cities';
type AstroComponent = (_props: Record<string, any>) => any;

type EntryArgs = {
  baseSlug: string;
  component: AstroComponent;
  baseTitle: string;
  baseH1: string;
  baseSubheading: string;
  canonical: string;
  seoKey: keyof typeof sharedSEO.serviceSEO;
};

export function generateServiceEntries({
  baseSlug,
  component,
  baseTitle,
  baseH1,
  baseSubheading,
  canonical,
  seoKey
}: EntryArgs): [string, any][] {
  return serviceCities.map(({ slugSuffix, label }) => {
    const isBase = slugSuffix === "";

    return [
      `${baseSlug}${slugSuffix}`,
      {
        title: isBase
          ? baseTitle
          : `${baseH1} in ${label}, AB | Debrah's Digital Solutions`,
        h1: isBase ? baseH1 : `${baseH1} in ${label}`,
        subheading: isBase
          ? baseSubheading
          : getCitySubheading(baseSlug, label),
        canonical,
        component,
        ...sharedSEO.serviceSEO[seoKey]
      }
    ];
  });
}

export function getCitySubheading(serviceSlug: string, city: string): string {
  const map: Record<string, string> = {
    "computer-repair": `Fast, Local Tech Support for Homes and Businesses in ${city}`,
    "network-optimization": `Wi-Fi and Network Help for Homes and Businesses in ${city}`,
    "ai-tools": `Automation and Smart Tools Tailored for ${city} Businesses`,
    "custom-software": `Custom Software Solutions for ${city} Entrepreneurs`,
    "onsite-support": `We Come to You – Tech Help Across ${city}`,
    "tech-consulting": `Smarter Tech Decisions for ${city}'s Small Businesses`,
    "training": `Modern Digital Skills Training for ${city}`,
    "website-development": `Professional Websites Built for ${city} Small Businesses`
  };

  return map[serviceSlug] || `Services available in ${city}`;
}
