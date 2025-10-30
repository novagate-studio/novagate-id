'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getCaptcha } from '@/services/capcha'
import { updateProfile } from '@/services/user'
import { useUser } from '@/contexts/user-context'
import { DobPicker } from '@/app/register/components/dob-picker'

// Form schema
const updateProfileSchema = z.object({
  fullName: z.string().min(1, {
    message: 'Họ và tên không được để trống',
  }),
  dob: z
    .date()
    .nullable()
    .refine(
      (date) => {
        return date !== null
      },
      {
        message: 'Vui lòng chọn ngày sinh',
      }
    ),
  gender: z.enum(['male', 'female', 'prefer-not-to-say'], {
    message: 'Vui lòng chọn giới tính',
  }),
  address: z.string().min(1, {
    message: 'Địa chỉ không được để trống',
  }),
  verifyCode: z.string().min(1, {
    message: 'Vui lòng nhập mã xác thực',
  }),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

export default function UpdateProfilePage() {
  const { user, refreshUser } = useUser()
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false)

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      dob: null,
      gender: 'prefer-not-to-say',
      address: '',
      verifyCode: '',
    },
  })

  // Update form with user data when user is loaded
  useEffect(() => {
    if (user) {
      const validGender = ['male', 'female', 'prefer-not-to-say'].includes(user.gender)
        ? (user.gender as 'male' | 'female' | 'prefer-not-to-say')
        : 'prefer-not-to-say'

      form.reset({
        fullName: user.full_name || '',
        dob: user.dob ? new Date(user.dob) : null,
        gender: validGender,
        address: user.address || '',
        verifyCode: '',
      })
    }
  }, [user, form])

  const fetchCaptcha = useCallback(async () => {
    setIsLoadingCaptcha(true)
    try {
      const image = await getCaptcha()
      setCaptchaImage(image)
    } catch (error) {
      toast.error('Không thể tải mã xác thực. Vui lòng thử lại.')
    } finally {
      setIsLoadingCaptcha(false)
    }
  }, [])

  // Load captcha on component mount
  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  // Handle form submission
  async function onSubmit(values: UpdateProfileFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Send profile update request with captcha
      const profileData = {
        full_name: values.fullName,
        dob: values.dob ? values.dob.toISOString().split('T')[0] : '', // Format as YYYY-MM-DD
        gender: values.gender,
        address: values.address,
        captcha: values.verifyCode,
      }

      const response = await updateProfile(profileData)

      if (response.code === 200) {
        toast.success('Cập nhật thông tin cá nhân thành công!')
        // Refresh user data to show updated info
        await refreshUser()
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi cập nhật thông tin cá nhân')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin cá nhân')
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
          <CardTitle className='text-2xl font-bold'>Đổi thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Full Name and Date of Birth Row */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6'>
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ & Tên</FormLabel>
                      <FormControl>
                        <Input placeholder='Hung Pham' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name='dob'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <DobPicker value={field.value} onChange={(date) => field.onChange(date || null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Gender */}
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='male' id='male' />
                          <Label htmlFor='male'>Nam</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='female' id='female' />
                          <Label htmlFor='female'>Nữ</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='prefer-not-to-say' id='prefer-not-to-say' />
                          <Label htmlFor='prefer-not-to-say'>Bí mật</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder='28 Trần Bình' {...field} />
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