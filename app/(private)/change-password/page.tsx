'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getCaptcha } from '@/services/captcha'
import { changePassword } from '@/services/auth'
import { useUser } from '@/contexts/user-context'

// Form schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: 'Vui lòng nhập mật khẩu hiện tại',
    }),
    newPassword: z
      .string()
      .min(8, {
        message: 'Mật khẩu phải có ít nhất 8 ký tự',
      })
      .max(128, {
        message: 'Mật khẩu không được vượt quá 128 ký tự',
      })
      .regex(/[a-z]/, {
        message: 'Mật khẩu phải chứa ít nhất một chữ cái thường',
      })
      .regex(/[A-Z]/, {
        message: 'Mật khẩu phải chứa ít nhất một chữ cái hoa',
      })
      .regex(/[0-9]/, {
        message: 'Mật khẩu phải chứa ít nhất một số',
      })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
        message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
      }),
    confirmPassword: z.string().min(1, {
      message: 'Vui lòng xác nhận mật khẩu mới',
    }),
    verifyCode: z.string().min(1, {
      message: 'Vui lòng nhập mã xác thực',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false)
  const { logout } = useUser()
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      verifyCode: '',
    },
  })

  const fetchCaptcha = async () => {
    setIsLoadingCaptcha(true)
    try {
      const image = await getCaptcha()
      setCaptchaImage(image)
    } catch (error) {
      toast.error('Không thể tải mã xác thực. Vui lòng thử lại.')
    } finally {
      setIsLoadingCaptcha(false)
    }
  }

  // Load captcha on component mount
  useEffect(() => {
    fetchCaptcha()
  }, [])

  // Handle form submission
  async function onSubmit(values: ChangePasswordFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Send password change request with captcha
      const passwordData = {
        old_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword,
        captcha: values.verifyCode,
      }

      const response = await changePassword(passwordData)

      if (response.code === 200) {
        form.reset()
        toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
        logout()
        // Reset form after successful submission
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi đổi mật khẩu')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đổi mật khẩu')
    } finally {
      fetchCaptcha() // Refresh captcha
      form.resetField('verifyCode') // Clear only the captcha field
      setIsSubmitting(false)
    }
  }

  return (
    <div className=''>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Current Password */}
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Mật khẩu hiện tại' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Mật khẩu mới' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm New Password */}
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Xác nhận mật khẩu mới' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Captcha */}
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <div>
                    {captchaImage ? (
                      <div
                        className='border rounded-md bg-gray-100 object-contain'
                        dangerouslySetInnerHTML={{ __html: captchaImage }}
                      />
                    ) : (
                      <div className='border rounded-md bg-gray-100 h-12 w-32 flex items-center justify-center'>
                        <span className='text-gray-400 text-sm'>Loading...</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={fetchCaptcha}
                    disabled={isLoadingCaptcha}
                    className='flex items-center gap-2'>
                    <RefreshCw className={cn('h-4 w-4', isLoadingCaptcha && 'animate-spin')} />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name='verifyCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã xác thực</FormLabel>
                      <FormControl>
                        <Input placeholder='Mã xác thực' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} className='flex-1 md:max-w-3xs'>
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
