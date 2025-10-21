import Image from 'next/image'
import Logo from '@/assets/logo/PNG_BLACK.png'

export default function Header() {
  return (
    <header className="w-full border-b bg-white px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Image 
            src={Logo} 
            alt="Novagate Logo" 
            width={120} 
            height={40} 
            className="h-20 w-auto"
          />
        </div>

        {/* User section on the right */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john.doe@example.com</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}