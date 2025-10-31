import Image from 'next/image'
import Logo from '@/assets/logo/PNG_WHITE.png'
export default function Footer() {
  return (
    <footer className='bg-linear-to-r from-blue-500 to-purple-600 text-white py-6 px-6'>
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10'>
        {/* Logo Section */}
        <div className='flex items-center gap-4'>
          <Image src={Logo} alt='Logo' className='w-28' />
        </div>

        {/* Company Information */}
        <div className='flex-1 text-center md:text-left space-y-1'>
          <p className='text-sm'>
            <span className='font-medium'>Email:</span> support@novagate.vn
          </p>
          <p className='text-sm font-medium'>Công ty Cổ phần Novagate Studio</p>
          <p className='text-xs leading-relaxed max-w-4xl'>Mã số doanh nghiệp: 0111227951</p>
          <p className='text-xs'>Copyright © 2025 Novagate Studio. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
