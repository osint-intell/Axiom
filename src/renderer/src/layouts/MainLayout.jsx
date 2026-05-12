import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-primary">
      <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-border bg-panel/90 backdrop-blur-xl">
        <Sidebar />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-[1600px]">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  )
}
