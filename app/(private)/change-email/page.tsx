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
import { getCaptcha } from '@/services/capcha'
import { changeEmail } from '@/services/user'

// Form schema
const changeEmailSchema = z.object({
  currentEmail: z.string().email({
    message: 'Vui lòng nhập email hợp lệ',
  }),
  newEmail: z.string().email({
    message: 'Vui lòng nhập email mới hợp lệ',
  }),
  verifyCode: z.string().min(1, {
    message: 'Vui lòng nhập mã xác thực',
  }),
})

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>

export default function ChangeEmailPage() {
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false)

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      currentEmail: '',
      newEmail: '',
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
  async function onSubmit(values: ChangeEmailFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Send email change request with captcha
      const emailData = {
        email: values.currentEmail,
        new_email: values.newEmail,
        captcha: values.verifyCode,
      }

      const response = await changeEmail(emailData)
      
      if (response.code === 200) {
        toast.success('Đổi email thành công!')
        // Reset form after successful submission
        form.reset()
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi đổi email')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đổi email')
    } finally {
      fetchCaptcha() // Refresh captcha
      form.setValue('verifyCode', '') // Reset verify code after fetching new captcha
      setIsSubmitting(false)
    }
  }

  return (
    <div className=''>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Đổi email</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Current Email */}
              <FormField
                control={form.control}
                name='currentEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email hiện tại</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Email */}
              <FormField
                control={form.control}
                name='newEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email mới</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='Email mới' {...field} />
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

              {/* Action Button */}
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