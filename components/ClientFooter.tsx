import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function ClientFooter() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg mb-4">Chicha Mobile</h3>
            <p className="text-sm text-muted-foreground">
              Pusat sparepart dan service handphone terpercaya dengan teknisi profesional.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Menu Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/client/produk" className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-500">Produk</Link></li>
              <li><Link href="/client/booking" className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-500">Booking Service</Link></li>
              <li><Link href="/client/progress" className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-500">Track Progress</Link></li>
              <li><Link href="/client/akun" className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-500">Akun Saya</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@chichamobile.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Chicha Mobile. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
