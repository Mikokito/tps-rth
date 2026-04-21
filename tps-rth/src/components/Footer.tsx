import Link from "next/link";
import { Leaf, Phone, Mail, MapPin, Globe, Rss, Tv } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-9 h-9 bg-[#2F855A] rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-lg text-white block leading-none">TPS RTH</span>
                <span className="text-[10px] text-gray-400 leading-none">Pengelolaan Sampah 3R</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-sm">
              Tempat Pengelolaan Sampah Ruang Terbuka Hijau Cikaret — solusi pengelolaan sampah berbasis
              komunitas menuju lingkungan Kota Bogor yang bersih dan sehat.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, label: "Website" },
                { icon: Rss, label: "Blog" },
                { icon: Tv, label: "Channel" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#2F855A] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigasi</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Beranda" },
                { href: "/tentang", label: "Tentang Kami" },
                { href: "/berita", label: "Berita" },
                { href: "/edukasi", label: "Edukasi" },
                { href: "/kontak", label: "Kontak" },
                { href: "/cara-daftar", label: "Cara Daftar" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#48BB78] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-[#48BB78] mt-0.5 flex-shrink-0" />
                <span>Jl. Taman RTH No. 12, Kelurahan Cikaret, Kota Bogor</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-[#48BB78] flex-shrink-0" />
                <span>+62 251-8765432</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-[#48BB78] flex-shrink-0" />
                <span>tpsrth.cikaret@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>© 2026 TPS RTH Cikaret. Hak cipta dilindungi.</p>
          <p>Dibuat untuk lingkungan yang lebih baik 🌿</p>
        </div>
      </div>
    </footer>
  );
}
