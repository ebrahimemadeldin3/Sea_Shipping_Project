/* eslint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)
const ParamsContext = createContext(null)

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, queryString = ''] = raw.split('?')
  const params = new URLSearchParams(queryString)
  const pathParts = path.split('/').filter(Boolean)
  const pathname = '/' + pathParts.join('/')
  return { pathname, params }
}

export function Router({ children }) {
  const [location, setLocation] = useState(() => parseHash())

  useEffect(() => {
    const onHashChange = () => setLocation(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const value = useMemo(
    () => ({
      ...location,
      navigate: (to, options = {}) => {
        const resolved = typeof to === 'object' ? `${to.path}${to.query ? '?' + to.query : ''}` : to
        const target = '#' + resolved
        if (options.replace) {
          window.location.replace(window.location.origin + window.location.pathname + target)
        } else {
          window.location.hash = target
        }
      },
    }),
    [location],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRoute() {
  const router = useContext(RouterContext)
  if (!router) throw new Error('useRoute must be used within <Router>')
  return router
}

export function useParams() {
  const paramsContext = useContext(ParamsContext)
  const router = useContext(RouterContext)
  return paramsContext || router?.params || new URLSearchParams()
}

export function useNavigate() {
  return useRoute().navigate
}

export function usePathname() {
  return useRoute().pathname
}

function toPath(to) {
  return typeof to === 'string' ? to : `${to.path}${to.query ? '?' + to.query : ''}`
}

export function Link({ to, className = '', activeClassName = '', children, onClick, ...rest }) {
  const { pathname, navigate } = useRoute()
  const resolved = toPath(to)
  const isActive = pathname === resolved.split('?')[0]
  const classes = [className, isActive && activeClassName].filter(Boolean).join(' ')

  const handleClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    if (typeof onClick === 'function') onClick(event)
    navigate(resolved)
  }

  return (
    <a href={'#' + resolved} className={classes} onClick={handleClick} aria-current={isActive ? 'page' : undefined} {...rest}>
      {children}
    </a>
  )
}

export function NavLink(props) {
  return <Link {...props} />
}

export function Navigate({ to, replace = true }) {
  const { navigate } = useRoute()
  useEffect(() => {
    navigate(toPath(to), { replace })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function matchRoute(pattern, pathname) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i]
    if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(pathParts[i])
    else if (p !== pathParts[i]) return null
  }
  return params
}

export function Route({ path, element }) {
  const { pathname, params } = useRoute()
  const matched = useMemo(() => matchRoute(path, pathname), [path, pathname])
  if (!matched) return null

  const merged = new URLSearchParams(params)
  Object.entries(matched).forEach(([key, value]) => merged.set(key, value))

  return <ParamsContext.Provider value={merged}>{element}</ParamsContext.Provider>
}
