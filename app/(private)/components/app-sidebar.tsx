'use client'

import * as React from 'react'

import Logo from '@/assets/logo/PNG_BLACK.png'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { User, CreditCard, Key, Mail, Phone, FileText, CreditCard as IdCard, LogOut, ShieldUser } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/contexts/user-context'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { logout } = useUser()
  const { setOpenMobile } = useSidebar()

  const handleMenuClick = () => {
    // Close sidebar on mobile after clicking menu item
    setOpenMobile(false)
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenuButton size={'lg'} className='cursor-default pointer-events-none'>
          <Image src={Logo} alt='Novagate Logo' className='w-10 h-auto' />
          <div className='whitespace-nowrap font-bold ml-2 text-xl'>Quản lý</div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/'} asChild>
                <Link href='/' onClick={handleMenuClick}>
                  <User className='size-5!' />
                  <span>Tài khoản</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/cccd'} asChild>
                <Link href='/cccd' onClick={handleMenuClick}>
                  <IdCard className='size-5!' />
                  <span>Cập nhật CCCD</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/change-password'} asChild>
                <Link href='/change-password' onClick={handleMenuClick}>
                  <Key className='size-5!' />
                  <span>Đổi mật khẩu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/change-email'} asChild>
                <Link href='/change-email' onClick={handleMenuClick}>
                  <Mail className='size-5!' />
                  <span>Đổi email</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/change-phone'} asChild>
                <Link href='/change-phone' onClick={handleMenuClick}>
                  <Phone className='size-5!' />
                  <span>Đổi số điện thoại</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/update-profile'} asChild>
                <Link href='/update-profile' onClick={handleMenuClick}>
                  <FileText className='size-5!' />
                  <span>Đổi thông tin cá nhân</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname === '/topup'} asChild>
                <Link
                  href={process.env.NEXT_PUBLIC_PAYMENT_WEBSITE_URL || ''}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={handleMenuClick}>
                  <CreditCard className='size-5!' />
                  <span>Nạp thẻ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                size={'lg'}
                className=' text-red-600 hover:text-red-700 hover:bg-red-50'
                onClick={() => {
                  handleMenuClick()
                  logout()
                }}>
                <LogOut className='size-5!' />
                <span>Đăng xuất</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
