"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NO_FOOTER_PATHS = ["/login", "/signup"];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
