import type { Metadata } from "next";
import ApodExperience from "@/components/apod-experience";

export const metadata: Metadata = {
  title: "APOD | NASA Signal Desk",
  description: "Astronomy Picture of the Day with quick date navigation and weekly comparison.",
};

type ApodPageProps = {
  searchParams: Promise<{ count?: string; date?: string }>;
};

export default async function ApodPage({ searchParams }: ApodPageProps) {
  return (
    <main className="space-y-6">
      <ApodExperience basePath="/apod" searchParams={await searchParams} />
    </main>
  );
}
