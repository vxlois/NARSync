import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import ToastViewport from '../../components/ToastViewport'

export default function AdminShell() {
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('admin-mode')
    return () => document.body.classList.remove('admin-mode')
  }, [])

  useEffect(() => {
    setNavOpen(false)
    mainRef.current?.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [navOpen])

  return (
    <div className="admin-app">
      <a className="adm-skip-link" href="#admin-main">
        Skip to main content
      </a>
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="adm-workspace">
        <AdminTopbar onOpenNav={() => setNavOpen(true)} />
        <main className="adm-main" id="admin-main" ref={mainRef}>
          <Outlet />
        </main>
      </div>
      <ToastViewport />
    </div>
  )
}
