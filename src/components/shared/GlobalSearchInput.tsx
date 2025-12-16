import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Loader2, CalendarDays, Users, ShieldCheck, UserCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { performGlobalSearch, type GlobalSearchResult, type GlobalSearchType } from '@/lib/global-search'
import { useDebounce } from '@/hooks/useDebounce'

const typeIconMap: Record<GlobalSearchType, typeof CalendarDays> = {
  event: CalendarDays,
  member: Users,
  organizer: UserCircle2,
  admin: ShieldCheck,
}

const typeDefaultLabel: Record<GlobalSearchType, string> = {
  event: 'Events',
  member: 'Members',
  organizer: 'Organizers',
  admin: 'Admins',
}

interface GlobalSearchInputProps {
  placeholder?: string
  inputClassName?: string
  autoFocus?: boolean
  onNavigate?: () => void
}

export const GlobalSearchInput = ({
  placeholder,
  inputClassName,
  autoFocus,
  onNavigate,
}: GlobalSearchInputProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, 350)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)
    performGlobalSearch(debouncedQuery)
      .then(data => {
        if (!active) return
        setResults(data)
        setError(null)
      })
      .catch(err => {
        console.error('Global search failed', err)
        if (!active) return
        setError(t('globalSearch.error', { defaultValue: 'Unable to search right now.' }))
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [debouncedQuery, t])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const groupedResults = useMemo(() => {
    return results.reduce<Record<GlobalSearchType, GlobalSearchResult[]>>((acc, item) => {
      if (!acc[item.type]) acc[item.type] = []
      acc[item.type].push(item)
      return acc
    }, { event: [], organizer: [], admin: [], member: [] })
  }, [results])

  const handleResultClick = (result: GlobalSearchResult) => {
    navigate(result.route, result.state ? { state: result.state } : undefined)
    setQuery('')
    setResults([])
    setIsOpen(false)
    onNavigate?.()
  }

  const handleSubmit = () => {
    if (results.length > 0) {
      handleResultClick(results[0])
    }
  }

  const showDropdown = isOpen && (isLoading || results.length > 0 || error)

  return (
    <div className="relative" ref={containerRef}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        value={query}
        autoFocus={autoFocus}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!isOpen) setIsOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSubmit()
          }
        }}
        placeholder={placeholder}
        className={cn(
          'pl-10 pr-10 py-2 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 transition-all duration-200 placeholder:text-gray-400',
          inputClassName,
        )}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="max-h-96 overflow-auto">
            {error && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                {error}
              </div>
            )}
            {!error && !isLoading && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t('globalSearch.noResults', { defaultValue: 'No matches found' })}
              </div>
            )}
            {!error &&
              (groupedResults.event.length ||
                groupedResults.organizer.length ||
                groupedResults.admin.length ||
                groupedResults.member.length) > 0 && (
                <div className="divide-y">
                  {(Object.keys(groupedResults) as GlobalSearchType[]).map(type => {
                    const section = groupedResults[type]
                    if (!section || section.length === 0) return null
                    const Icon = typeIconMap[type]
                    const label = t(`globalSearch.sections.${type}`, { defaultValue: typeDefaultLabel[type] })
                    return (
                      <div key={type}>
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {label}
                        </div>
                        <div className="flex flex-col">
                          {section.map(result => (
                            <button
                              key={`${type}-${result.id}`}
                              type="button"
                              onClick={() => handleResultClick(result)}
                              className="flex items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                {result.avatar ? (
                                  <img
                                    src={result.avatar}
                                    alt={result.title}
                                    className="h-full w-full rounded-lg object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{result.title}</p>
                                {(result.subtitle || result.meta) && (
                                  <p className="text-xs text-muted-foreground">
                                    {[result.subtitle, result.meta].filter(Boolean).join(' • ')}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {label}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('globalSearch.loading', { defaultValue: 'Searching...' })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

