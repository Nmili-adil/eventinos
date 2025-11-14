import { Link } from "react-router-dom"
import { Facebook, Instagram, Github } from 'lucide-react'


export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/Eventinas Logo.jpeg" 
              alt="UrEvent Logo" 
              className="h-12 w-12 mr-2 object-cover"
            />
           
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Eventinas. Tous droits réservés.
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