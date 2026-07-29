import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "Aura - Women's Health & Wellness Companion",
  description: "Track menstrual health, log daily symptoms, and receive personalized insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="app-container">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
