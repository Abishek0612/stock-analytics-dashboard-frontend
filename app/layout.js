import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { Providers } from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stock Analytics Dashboard",
  description: "Track and analyze stock market performance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
