import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RILIKS - Premium Fashion E-Commerce",
  description: "Discover the latest fashion trends and premium clothing at RILIKS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Rubik+Glitch&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-brand-burgundy dark:bg-black" style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
