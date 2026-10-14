import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "CloudNativeHub Study Planner",
  description: "Cloud-native study planner for courses, modules and deadlines",
};

// Signed-in pages get the app shell; the sign-in page renders on its own.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" className={inter.variable}>
      <body>
        {user ? (
          <div className="app">
            <Sidebar user={{ name: user.name, email: user.email }} />
            <main className="content">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
