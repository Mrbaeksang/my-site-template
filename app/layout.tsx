import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { InlineEditorProvider } from "@/contexts/inline-editor-context"
import { SiteTitle } from "@/components/site-title"
import { defaultConfig } from "@/lib/site-config"
import { getSiteUrl } from "@/lib/site-url"
import "./globals.css"

const FONT_CSS_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
const siteUrl = getSiteUrl()
const { siteTitle, siteDescription } = defaultConfig

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    images: [{ url: "/api/og-image", width: 1200, height: 630, alt: siteTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/api/og-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* 글꼴 CSS가 첫 화면 표시를 막지 않도록 비동기로 불러온다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement("link");l.rel="stylesheet";l.crossOrigin="anonymous";l.href="${FONT_CSS_URL}";document.head.appendChild(l)})()`,
          }}
        />
        <noscript>
          <link rel="stylesheet" crossOrigin="anonymous" href={FONT_CSS_URL} />
        </noscript>
      </head>
      <body className="font-pretendard" suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <InlineEditorProvider>
            <SiteTitle />
            {children}
          </InlineEditorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
