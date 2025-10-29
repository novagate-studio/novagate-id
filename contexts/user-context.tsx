'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getProfile } from '@/services/user'
import { cookiesInstance } from '@/services/cookies'
import { useRouter } from 'next/navigation'
import { User } from '@/models/user'


interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = cookiesInstance.get('access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await getProfile()
      if (response.code === 200) {
        setUser(response.data)
      } else {
        throw new Error(response.errors?.vi || response.errors?.en || 'Failed to fetch user profile')
      }
    } catch (err: any) {
      setError(err.message)
      
      // If token is invalid, redirect to login
      if (err.message.includes('token') || err.message.includes('unauthorized')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUserProfile()
  }

  const logout = () => {
    setUser(null)
    setError(null)
    cookiesInstance.remove('access_token')
    router.push('/login')
  }

  useEffect(() => {
    const token = cookiesInstance.get('access_token')
    if (token) {
      fetchUserProfile()
    } else {
      setLoading(false)
      router.push('/login')
    }
  }, [])

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}