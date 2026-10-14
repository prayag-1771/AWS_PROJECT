"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

function initials(name: string) {
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}

export default function Sidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function signOut() {
    setLeaving(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

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

      <p className="nav-label">Menu</p>

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

      <div className="author">
        <small>Developed by</small>
        <strong>Prayag Sharma</strong>
        <span>Reg. No. 24BCE1243</span>
      </div>

      <div className="user-card">
        <div className="avatar">{initials(user.name)}</div>
        <div className="user-meta">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
        <button
          className="icon-button"
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={signOut}
          disabled={leaving}
        >
          <Icon name="logout" size={17} />
        </button>
      </div>

      <div className="sidebar-bottom">
        <i className="dot" /> AWS Mumbai · ap-south-1
      </div>
    </aside>
  );
}
