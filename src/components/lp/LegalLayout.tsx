"use client";

/**
 * Shared layout for legal pages (Terms, Privacy, Cookies, DPA).
 * Provides consistent header, navigation back, and prose typography.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LpNavbar } from "./LpNavbar";
import { LpFooter } from "./LpFooter";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function LegalLayout({
  title,
  lastUpdated,
  backLabel = "Voltar ao site",
  children,
}: LegalLayoutProps) {
  return (
    <>
      <LpNavbar />
      <div className="min-h-screen bg-white pt-16">
        <div className="bg-stone-50 border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {title}
            </h1>
            <p className="text-stone-500 mt-2 text-sm">{lastUpdated}</p>
          </div>
        </div>
        <article className="max-w-4xl mx-auto px-6 py-12 prose prose-stone prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-3 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-stone-700 prose-li:text-stone-700 prose-a:text-teal-600 hover:prose-a:text-teal-700">
          {children}
        </article>
      </div>
      <LpFooter />
    </>
  );
}
