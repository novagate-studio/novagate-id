'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DOCUMENT_TYPE } from '@/constants'
import { useUser } from '@/contexts/user-context'
export default function Home() {
  const { user, loading, error, refreshUser } = useUser()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-red-600'>Lỗi</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshUser} className='w-full'>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Helper function to mask sensitive data
  const maskPhone = (phone: string | undefined) => {
    if (!phone) return ''
    return phone.replace(/.(?=.{4})/g, '*')
  }

  const maskEmail = (email: string | undefined) => {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (username.length <= 2) return email
    const maskedUsername = '*'.repeat(username.length - 2) + username.slice(-2)
    return `${maskedUsername}@${domain}`
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className='space-y-4'>
      <Card className='shadow-lg'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-2xl font-bold text-gray-900'>Xin Chào, {user?.username}!</CardTitle>
          <CardDescription className='text-base text-gray-600 mt-2'>Thông tin tài khoản của bạn:</CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 text-sm'>
            {/* Personal Information */}
            <div className='space-y-4'>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Họ và Tên:</span>
                <span className='text-gray-900 font-semibold'>{user?.full_name || 'Chưa cập nhật'}</span>
              </div>

              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Ngày Sinh:</span>
                <span className='text-gray-900 font-semibold'>{formatDate(user?.dob) || 'Chưa cập nhật'}</span>
              </div>

              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Giới tính:</span>
                <span className='text-gray-900 font-semibold'>
                  {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                </span>
              </div>

              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Điện thoại:</span>
                <span className='text-gray-900 font-semibold'>{maskPhone(user?.phone) || 'Chưa cập nhật'}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Email:</span>
                <span className='text-gray-900 font-semibold'>{maskEmail(user?.email) || 'Chưa cập nhật'}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600 font-medium'>Địa Chỉ:</span>
                <span className='text-gray-900 font-semibold'>{user?.address || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* Contact & Document Information */}
            <div className='space-y-4'>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Loại giấy tờ:</span>
                <span className='text-gray-900 font-semibold'>
                  {user?.user_identity_documents?.[0]?.document_type === DOCUMENT_TYPE.CCCD
                    ? 'Căn cước công dân'
                    : user?.user_identity_documents?.[0]?.document_type === DOCUMENT_TYPE.PASSPORT
                    ? 'Hộ chiếu'
                    : 'Chưa cập nhật'}
                </span>
              </div>

              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>
                  {user?.user_identity_documents?.[0]?.document_type === DOCUMENT_TYPE.PASSPORT
                    ? 'Số Hộ chiếu:'
                    : 'Số CCCD:'}
                </span>
                <span className='text-gray-900 font-semibold'>
                  {user?.user_identity_documents?.[0]?.document_number || 'Chưa cập nhật'}
                </span>
              </div>

              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Ngày Cấp:</span>
                <span className='text-gray-900 font-semibold'>
                  {user?.user_identity_documents?.[0]?.issue_date
                    ? formatDate(user.user_identity_documents[0].issue_date)
                    : 'Chưa cập nhật'}
                </span>
              </div>

              <div className='flex justify-between py-2 '>
                <span className='text-gray-600 font-medium'>Nơi Cấp:</span>
                <span className='text-gray-900 font-semibold'>
                  {user?.user_identity_documents?.[0]?.place_of_issue || 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className='pt-6 border-t border-gray-200'>
            <Button onClick={refreshUser} variant='outline' className='w-full md:w-auto'>
              Làm mới thông tin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
