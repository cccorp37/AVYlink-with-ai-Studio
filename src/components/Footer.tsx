import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Mail,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,hsl(204,94%,52%,0.08),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16"
        >
          {/* Brand */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-2.5">
              <img
                src="/icon-192.jpg"
                alt="AvyLink Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="font-dm font-black text-2xl text-white">
                Avy<span className="text-primary">Link</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              La plateforme de portfolio personnalisable conçue pour les
              créateurs africains et du monde entier.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: Facebook, label: "Facebook" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-primary hover:bg-white/[0.08] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Produit",
              links: [
                "Fonctionnalités",
                "Tarifs",
                "Templates",
                "Démo live",
                "Changelog",
              ],
            },
            {
              title: "Ressources",
              links: [
                "Documentation",
                "Blog",
                "Tutoriels vidéo",
                "API",
                "Statut",
              ],
            },
            {
              title: "Entreprise",
              links: [
                "À propos",
                "Contact",
                "Partenaires",
                "Mentions légales",
                "Confidentialité",
              ],
            },
          ].map((col) => (
            <div key={col.title} className="md:col-span-2 space-y-4">
              <h4 className="font-dm font-bold text-white/60 text-[11px] uppercase tracking-[0.15em]">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/35 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 mb-12 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="flex-1">
            <h4 className="font-dm font-bold text-white text-lg mb-1">
              Reste informé 💌
            </h4>
            <p className="text-white/35 text-sm">
              Nouveautés, astuces et offres exclusives.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="ton@email.com"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-primary/40 flex-1 sm:w-64 transition-colors"
            />
            <button className="gradient-cta text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0">
              <Mail className="w-4 h-4" />
              S'abonner
            </button>
          </div>
        </motion.div>

        {/* Bottom */}
        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-sm">
            © 2026 AvyLink — Fait avec 💙 en Afrique
          </p>
          <div className="flex items-center gap-4 text-white/25 text-xs">
            <span>🇫🇷 Français</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>🇬🇧 English</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
