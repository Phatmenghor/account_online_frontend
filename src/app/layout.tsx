import type { Metadata } from "next";
import { getMessages, getLocale } from "next-intl/server";
import PageProgressBar from "@/components/shared/progressbar/Nprogressbar/global-n-progress";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { type Locale } from "@/i18n/request";
import { LocaleProvider } from "@/context/provider/local-provider";
import { ClientProviders } from "@/context/provider/client-provider";
import { ToastProvider } from "@/components/shared/toast/app-toast";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dashboard Template",
  description: "Dashboard Template application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get initial server-side locale and messages (always default for clean URLs)
  const serverLocale = (await getLocale()) as Locale;
  const serverMessages = await getMessages();

  console.log("Layout - Server locale:", serverLocale);

  return (
    <html
      lang={serverLocale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <LocaleProvider
          initialLocale={serverLocale}
          initialMessages={serverMessages}
        >
          <ClientProviders>
            <PageProgressBar />
            <ToastProvider>{children}</ToastProvider>
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
