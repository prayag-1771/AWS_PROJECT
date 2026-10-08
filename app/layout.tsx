import "./globals.css";
import Sidebar from "./components/Sidebar";

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
      <body>
        <div className="app">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
