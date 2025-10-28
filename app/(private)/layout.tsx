'use client'

import Header from '@/components/header'
import { Spinner } from '@/components/ui/spinner'
import { cookiesInstance } from '@/services/cookies'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [hasAccessToken, setHasAccessToken] = useState<boolean | undefined>()
  const router = useRouter()
  useEffect(() => {
    const token = cookiesInstance.get('access_token')
    if (!token) {
      router.push('/login')
      setHasAccessToken(false)
    } else {
      setHasAccessToken(true)
    }
  }, [])
  if (hasAccessToken === undefined) {
    return (
      <div className='w-screen h-screen flex items-center justify-center'>
        <Spinner className='size-8' />
      </div>
    )
  }
  if (hasAccessToken === false) {
    return null
  }
  return (
    <>
      <Header />
      {children}
    </>
  )
}
