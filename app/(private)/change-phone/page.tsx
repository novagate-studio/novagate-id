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
import { changePhone } from '@/services/user'

// Form schema
const changePhoneSchema = z.object({
  currentPhone: z.string().min(1, {
    message: 'Vui lòng nhập số điện thoại hiện tại',
  }).regex(/^[0-9+\-\s()]+$/, {
    message: 'Số điện thoại không hợp lệ',
  }),
  newPhone: z.string().min(1, {
    message: 'Vui lòng nhập số điện thoại mới',
  }).regex(/^[0-9+\-\s()]+$/, {
    message: 'Số điện thoại mới không hợp lệ',
  }),
  verifyCode: z.string().min(1, {
    message: 'Vui lòng nhập mã xác thực',
  }),
})

type ChangePhoneFormData = z.infer<typeof changePhoneSchema>

export default function ChangePhonePage() {
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false)

  const form = useForm<ChangePhoneFormData>({
    resolver: zodResolver(changePhoneSchema),
    defaultValues: {
      currentPhone: '',
      newPhone: '',
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
  async function onSubmit(values: ChangePhoneFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Send phone change request with captcha
      const phoneData = {
        phone: values.currentPhone,
        new_phone: values.newPhone,
        captcha: values.verifyCode,
      }

      const response = await changePhone(phoneData)
      
      if (response.code === 200) {
        toast.success('Đổi số điện thoại thành công!')
        // Reset form after successful submission
        form.reset()
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi đổi số điện thoại')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đổi số điện thoại')
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
          <CardTitle className='text-2xl font-bold'>Đổi số điện thoại</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Current Phone */}
              <FormField
                control={form.control}
                name='currentPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại hiện tại</FormLabel>
                    <FormControl>
                      <Input type='tel' placeholder='0xxxxxxxxx' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Phone */}
              <FormField
                control={form.control}
                name='newPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại mới</FormLabel>
                    <FormControl>
                      <Input type='tel' placeholder='Số điện thoại mới' {...field} />
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