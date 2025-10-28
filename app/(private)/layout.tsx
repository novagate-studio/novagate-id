'use client'

import { AppSidebar } from '@/app/(private)/components/app-sidebar'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import { UserProvider, useUser } from '@/contexts/user-context'

function PrivateLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useUser()

  if (loading) {
    return (
      <div className='w-screen h-screen flex items-center justify-center'>
        <Spinner className='size-8' />
      </div>
    )
  }

  if (error && !user) {
    return null // UserContext will handle redirect to login
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className='min-h-screen flex flex-col'>
          <Header />
          <div className='p-4 flex-1'>{children}</div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserProvider>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </UserProvider>
  )
}
