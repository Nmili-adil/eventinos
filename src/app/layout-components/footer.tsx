import { Link } from "react-router-dom"
import { Facebook, Instagram, Github, Mail, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from "@/components/ui/separator"


export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg blur opacity-20"></div>
              <img 
                src="/Eventinas Logo.jpeg" 
                alt="Eventinas Logo" 
                className="relative h-10 w-10 rounded-lg object-cover border-2 border-white shadow-md"
              />
            </div>
            <div className="hidden sm:block">
              <h3 className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Eventinas
              </h3>
              <p className="text-xs text-slate-500">
                {t('footer.tagline', 'Event Management Platform')}
              </p>
            </div>
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
          </div>

          {/* Separator for mobile */}
          <Separator className="md:hidden w-full" />

          {/* Social Links */}
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </footer>
  )
}