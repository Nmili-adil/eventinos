import { Link } from "react-router-dom"
import { Facebook, Instagram, Github } from 'lucide-react'


export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/logo-bg.svg" 
              alt="UrEvent Logo" 
              className="h-8 w-8 mr-2"
            />
            <span className="text-lg font-semibold text-gray-900">
              Eventinos
            </span>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Eventinos. Tous droits réservés.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="#">
                <Facebook size={16} className=" text-gray-400" />
            </Link>
            <Link to="#">
                <Instagram size={16} className=" text-gray-400" />
            </Link>
            <Link to="#">
                <Github size={16} className=" text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}