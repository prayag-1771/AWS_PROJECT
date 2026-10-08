import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./Icon";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  back,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <>
      {back && (
        <Link className="back-link" href={back.href}>
          <Icon name="back" size={15} />
          {back.label}
        </Link>
      )}

      <header className="topbar">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>

        {children && <div className="topbar-actions">{children}</div>}
      </header>
    </>
  );
}
