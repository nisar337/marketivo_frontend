/** After login: return to intended page (e.g. /admin), else vendor dashboard or home. */
export function resolveAfterLogin(user, from) {
  const path = from?.pathname
  if (path && path !== '/login' && path !== '/register') {
    return path + (from.search || '')
  }
  if (user?.role === 'vendor') return '/vendor/dashboard'
  return '/'
}
