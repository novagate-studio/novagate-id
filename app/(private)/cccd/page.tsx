'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import axiosInstance from '@/services/axios'
import { getCaptcha, verifyCaptcha } from '@/services/capcha'
import { addIdentifyDocument } from '@/services/user'
import Image from 'next/image'

// Form schema
const cccdSchema = z.object({
  documentType: z.string().min(1, {
    message: 'Vui lòng chọn loại giấy tô',
  }),
  documentNumber: z.string().min(1, {
    message: 'Vui lòng nhập số CCCD/Hộ chiếu',
  }),
  issuedPlace: z.string().min(1, {
    message: 'Vui lòng nhập nơi cấp',
  }),
  issuedDate: z.date({
    message: 'Vui lòng chọn ngày cấp',
  }),
  verifyCode: z.string().min(1, {
    message: 'Vui lòng nhập mã xác thực',
  }),
})

type CCCDFormData = z.infer<typeof cccdSchema>

// Document types
const documentTypes = [
  { value: 'cccd', label: 'Căn cước công dân' },
  { value: 'passport', label: 'Hộ chiếu' },
]

export default function CCCDPage() {
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false)

  const form = useForm<CCCDFormData>({
    resolver: zodResolver(cccdSchema),
    defaultValues: {
      documentType: '',
      documentNumber: '',
      issuedPlace: '',
      verifyCode: '',
    },
  })

  const fetchCaptcha = async () => {
    setIsLoadingCaptcha(true)
    try {
      const image = await getCaptcha()
      form.resetField('verifyCode')
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
  async function onSubmit(values: CCCDFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // First verify captcha
      const verifyResponse = await verifyCaptcha(values.verifyCode)
      if (verifyResponse.code !== 200) {
        toast.error('Mã xác thực không đúng. Vui lòng thử lại.')
        fetchCaptcha() // Refresh captcha on failed verification
        return
      }

      // If captcha is valid, proceed with adding identity document
      const documentData = {
        document_number: values.documentNumber,
        document_type: values.documentType,
        place_of_issue: values.issuedPlace,
        issue_date: format(values.issuedDate, 'yyyy-MM-dd'), // Format date for API
      }

      const response = await addIdentifyDocument(documentData)

      if (response.code === 200) {
        toast.success('Cập nhật thông tin CCCD thành công!')
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi cập nhật thông tin CCCD')
      }

      // Reset form after successful submission
      form.reset()
      fetchCaptcha() // Refresh captcha
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin CCCD')
      fetchCaptcha() // Refresh captcha on error
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className=''>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Thông tin CCCD</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Document Type */}
              <div className='grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4'>
                <FormField
                  control={form.control}
                  name='documentType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CCCD/Hộ Chiếu</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Căn cước công dân' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document Number */}
                <FormField
                  control={form.control}
                  name='documentNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số CCCD/Hộ chiếu</FormLabel>
                      <FormControl>
                        <Input placeholder='Số CCCD/Hộ chiếu' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Issued Place */}
              <FormField
                control={form.control}
                name='issuedPlace'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nơi cấp</FormLabel>
                    <FormControl>
                      <Input placeholder='Nơi cấp' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Issued Date */}
              <FormField
                control={form.control}
                name='issuedDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Ngày cấp</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}>
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: vi })
                            ) : (
                              <span>Chọn Ngày Cấp</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          captionLayout='dropdown'
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
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
