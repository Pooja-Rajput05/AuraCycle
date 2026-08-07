import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";

export const metadata = {
  title: {
    default: "AuraCycle — Women's Health & Wellness Companion",
    template: "%s | AuraCycle",
  },
  description:
    "Track menstrual health, log daily symptoms, and receive personalized wellness insights. A compassionate digital companion for women's health.",
  keywords: [
    "menstrual health",
    "cycle tracker",
    "women's wellness",
    "period tracker",
    "health companion",
  ],
  authors: [{ name: "AuraCycle" }],
  openGraph: {
    title: "AuraCycle — Women's Health & Wellness Companion",
    description:
      "Understand your body, honor your rhythm. Track cycles, symptoms, and wellness with personalized insights.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Navigation />
          <main className="app-container">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
