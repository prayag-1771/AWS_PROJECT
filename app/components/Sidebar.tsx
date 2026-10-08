"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const links = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/courses", label: "Courses", icon: "courses" },
  { href: "/modules", label: "Modules", icon: "modules" },
  { href: "/deadlines", label: "Deadlines", icon: "deadlines" },
  { href: "/storage", label: "Materials", icon: "file" },
  { href: "/architecture", label: "Architecture", icon: "architecture" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <div className="brand-icon">
          <Icon name="cloud" />
        </div>
        <span>
          CloudNativeHub
          <small>Study Planner</small>
        </span>
      </Link>

      <nav>
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              className={active ? "nav-link active" : "nav-link"}
              href={link.href}
              key={link.href}
            >
              <Icon name={link.icon} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <span>
          <i className="dot" /> AWS Mumbai
        </span>
        <small>ap-south-1</small>
      </div>
    </aside>
  );
}
