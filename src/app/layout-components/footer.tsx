import { Link } from "react-router-dom"
import { Facebook, Instagram, Github, Mail, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from "@/components/ui/separator"
import { getVersionDisplay } from "@/config/version"


export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-10 ">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <img 
              src="/Eventinas Logo.jpeg" 
              alt="Eventinas Logo" 
              className="h-14 w-14 object-cover"
            />
          </div>

          {/* Separator for mobile */}
          <Separator className="md:hidden w-full" />

          {/* Copyright & Info */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-slate-600 flex items-center gap-1">
              &copy; {currentYear} Eventinas. {t('footer.rights', 'All rights reserved')}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              {t('footer.madeWith', 'Made with')} <Heart className="h-3 w-3 text-red-500 fill-red-500" /> {t('footer.by', 'by')} <span className="font-medium text-slate-700">ARTECREA Team</span>
            </p>
            <p className="text-xs text-slate-400">
              {getVersionDisplay()}
            </p>
          </div>

          {/* Separator for mobile */}
          <Separator className="md:hidden w-full" />

          {/* Social Links */}
          {/* <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1 hidden sm:inline">
              {t('footer.followUs', 'Follow us')}:
            </span>
            <Link 
              to="#" 
              className="group relative p-2 rounded-lg bg-slate-100 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook size={14} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
            </Link>
            <Link 
              to="#" 
              className="group relative p-2 rounded-lg bg-slate-100 hover:bg-pink-100 transition-all duration-200 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={14} className="text-slate-600 group-hover:text-pink-600 transition-colors" />
            </Link>
            <Link 
              to="#" 
              className="group relative p-2 rounded-lg bg-slate-100 hover:bg-slate-900 transition-all duration-200 hover:scale-110"
              aria-label="GitHub"
            >
              <Github size={14} className="text-slate-600 group-hover:text-white transition-colors" />
            </Link>
            <Link 
              to="#" 
              className="group relative p-2 rounded-lg bg-slate-100 hover:bg-green-100 transition-all duration-200 hover:scale-110"
              aria-label="Email"
            >
              <Mail size={14} className="text-slate-600 group-hover:text-green-600 transition-colors" />
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  )
}