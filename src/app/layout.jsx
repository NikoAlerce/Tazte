import { Playfair_Display, Outfit, Great_Vibes } from "next/font/google";
import Navigation from "@/components/Navigation";
import AmbientBackground from "@/components/AmbientBackground";
import { Web3Providers } from "@/components/Web3Providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Taste | High-Fidelity Connections",
  description: "The Private Parlor for the Tezos Art Community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${outfit.variable} ${greatVibes.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <AmbientBackground />
        <Web3Providers>
          <main className="flex-grow flex flex-col items-center justify-center relative w-full max-w-md mx-auto h-full min-h-screen overflow-hidden z-10">
            {children}
            <Navigation />
          </main>
        </Web3Providers>
      </body>
    </html>
  );
}
