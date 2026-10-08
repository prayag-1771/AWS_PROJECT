import "./globals.css";

export const metadata = {
  title: "CloudNativeHub",
  description: "Cloud-native application management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}