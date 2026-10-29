import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'
import ToastViewport from './ToastViewport'

const NAV_ROUTES = ['/dashboard', '/duty', '/attendance', '/history', '/profile', '/settings']

function shouldShowNav(pathname, isAuthenticated) {
  if (!isAuthenticated) return false
  if (NAV_ROUTES.includes(pathname)) return true
  return pathname.startsWith('/history/')
}

export default function AppShell() {
  const { isAuthenticated } = useApp()
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return (
    <div className="app" id="app-root">
      <main className="app__main" ref={mainRef} id="main-content">
        <Outlet />
      </main>
      {shouldShowNav(pathname, isAuthenticated) && <BottomNav />}
      <ToastViewport />
    </div>
  )
}
