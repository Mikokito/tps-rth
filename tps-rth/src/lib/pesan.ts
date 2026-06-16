export const SUBJEK_STYLE: Record<string, string> = {
  Layanan: "bg-blue-50 text-blue-700",
  Keluhan: "bg-red-50 text-red-700",
  Kerjasama: "bg-purple-50 text-purple-700",
  Pendaftaran: "bg-green-50 text-green-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

export function buildWaLink(whatsapp: string | null): string | null {
  if (!whatsapp) return null;
  let digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (!digits.startsWith("62")) digits = "62" + digits;
  return `https://wa.me/${digits}`;
}

export function buildMailtoLink(email: string, subjek: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(`Re: ${subjek} - TPS RTH Cikaret`)}`;
}
