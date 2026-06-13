import { DM_Sans, Fraunces } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import "@/lib/network/initOutboundProxy";
import "@/shared/services/bootstrap";
import { initConsoleLogCapture } from "@/lib/consoleLogBuffer";
import { RuntimeI18nProvider } from "@/i18n/RuntimeI18nProvider";
import { loadLocaleLiterals } from "@/lib/i18n/loadLiterals";
import { resolveServerLocale } from "@/lib/i18n/serverLocale";

initConsoleLogCapture();

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "9Router",
  description: "AI provider routing and management",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#070b14",
};

export default async function RootLayout({ children }) {
  const locale = await resolveServerLocale();
  const literals = loadLocaleLiterals(locale);

  return (
    <html lang={locale} suppressHydrationWarning className="i18n-pending">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__9ROUTER_LOCALE__=${JSON.stringify(locale)};window.__9ROUTER_TRANSLATIONS__=${JSON.stringify(literals)};document.documentElement.classList.add('i18n-pending');(function(){function mark(){document.documentElement.classList.add('fonts-loaded')}if(!document.fonts){mark();return}Promise.all([document.fonts.ready,document.fonts.load('400 24px \"Material Symbols Outlined\"').catch(function(){})]).then(mark).catch(mark)})()`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased`}>
        <ThemeProvider>
          <RuntimeI18nProvider initialLocale={locale}>
            {children}
          </RuntimeI18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}