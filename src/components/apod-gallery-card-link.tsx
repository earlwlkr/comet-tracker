"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

type ApodGalleryCardLinkProps = {
  children: React.ReactNode;
  className: string;
  href: string;
  loadingLabel?: string;
};

function PendingOverlay({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`apod-gallery-pending ${pending ? "is-pending" : ""}`}
    >
      <span className={`link-pending-dot ${pending ? "is-pending" : ""}`} />
      <span className="apod-gallery-pending-label">{label}</span>
    </span>
  );
}

export default function ApodGalleryCardLink({
  children,
  className,
  href,
  loadingLabel = "Loading",
}: ApodGalleryCardLinkProps) {
  return (
    <Link className={`${className} apod-gallery-link`} href={href}>
      <PendingOverlay label={loadingLabel} />
      {children}
    </Link>
  );
}
