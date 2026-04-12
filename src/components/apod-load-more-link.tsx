"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

type ApodLoadMoreLinkProps = {
  href: string;
  label: string;
};

function PendingHint() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`link-pending-dot ${pending ? "is-pending" : ""}`}
    />
  );
}

export default function ApodLoadMoreLink({ href, label }: ApodLoadMoreLinkProps) {
  return (
    <Link className="nav-chip inline-flex items-center gap-3" href={href} prefetch={false}>
      <span>{label}</span>
      <PendingHint />
    </Link>
  );
}
