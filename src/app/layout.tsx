import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { siteMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: {
    default: siteMetadata.siteName,
    template: `%s | ${siteMetadata.siteName}`,
  },
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  creator: siteMetadata.author,
  robots: "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large",
  metadataBase: new URL(siteMetadata.siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.siteName,
    title: siteMetadata.siteName,
    description: "Tech Help at Your Doorstep – Fast, Friendly, Local.",
    images: [
      {
        url: `${siteMetadata.siteUrl}${siteMetadata.ogImage}`,
        width: 1200,
        height: 630,
        alt: "Debrah's Digital Solutions logo and service banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.siteName,
    description: "Tailored tech help and automation for businesses and homes in Alberta.",
    images: [`${siteMetadata.siteUrl}${siteMetadata.ogImage}`],
  },
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
