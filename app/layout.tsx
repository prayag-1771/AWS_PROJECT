import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "CloudNativeHub Study Planner",
  description: "Cloud-native study planner for courses, modules and deadlines",
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
