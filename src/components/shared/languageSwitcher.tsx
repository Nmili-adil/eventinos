import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { GB, FR, MA } from 'country-flag-icons/string/3x2'

const allLanguages = [
  { code: 'en', name: 'English', flag: GB },
  { code: 'fr', name: 'Français', flag: FR },
  { code: 'ar', name: 'العربية', flag: MA },
]

interface LanguageSwitcherProps {
  allowedLanguages?: string[]
}

const LanguageSwitcher = ({ allowedLanguages }: LanguageSwitcherProps = {}) => {
  const { i18n } = useTranslation()

  // Filter languages based on allowedLanguages prop
  const languages = allowedLanguages 
    ? allLanguages.filter(lang => allowedLanguages.includes(lang.code))
    : allLanguages

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lng
    // Update dir attribute for RTL languages
    // if (lng === 'ar') {
    //   document.documentElement.dir = 'rtl'
    // } else {
    //   document.documentElement.dir = 'ltr'
    // }
  }

  const currentLanguage = languages.find((lang) => lang.code === i18n.resolvedLanguage) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center  h-10 px-3 bg-gray-100 hover:bg-gray-200 transition-colors border-slate-300"
        >
          
          <span 
            className="w-6 h-4 flex-shrink-0"
            dangerouslySetInnerHTML={{ __html: currentLanguage.flag }}
          />
          <span className="hidden sm:block text-xs font-medium text-gray-700">
            {currentLanguage.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              i18n.resolvedLanguage === language.code
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'hover:bg-gray-100'
            }`}
          >
            <span 
              className="w-6 h-4 flex-shrink-0"
              dangerouslySetInnerHTML={{ __html: language.flag }}
            />
            <span className="flex-1 text-xs">{language.name}</span>
            {i18n.resolvedLanguage === language.code && (
              <span className="text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher

