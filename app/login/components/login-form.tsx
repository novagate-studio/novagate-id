'use client'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Link from 'next/link'
import { useState } from 'react'
import { login } from '@/services/auth'
import { toast } from 'sonner'
import { cookiesInstance } from '@/services/cookies'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: 'Tên đăng nhập không được để trống',
    })
    .min(4, {
      message: 'Tên đăng nhập phải có ít nhất 4 ký tự',
    }),
  password: z
    .string()
    .min(1, {
      message: 'Mật khẩu không được để trống',
    })
    .min(8, {
      message: 'Mật khẩu phải có ít nhất 8 ký tự',
    }),
})

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await login(values.username, values.password)
      if (response.code === 200) {
        cookiesInstance.set('access_token', response.data.token)
        router.push('/')
        toast.success('Đăng nhập thành công!')
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Form {...form}>
      <form className={cn('flex flex-col gap-6', className)} onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <FieldGroup>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h1 className='text-2xl font-bold'>Đăng nhập tài khoản</h1>
            <p className='text-muted-foreground text-sm text-balance'>
              Nhập tên đăng nhập và mật khẩu để đăng nhập vào tài khoản của bạn
            </p>
          </div>

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl>
                  <Input type='text' placeholder='Nhập tên đăng nhập của bạn' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>Mật khẩu</FormLabel>
                  <Link
                    href='/forgot-password'
                    className='text-sm text-muted-foreground underline-offset-4 hover:underline'>
                    Quên mật khẩu?
                  </Link>
                </div>
                <FormControl>
                  <Input type='password' placeholder='Nhập mật khẩu của bạn' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Field>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <FieldDescription className='text-center'>
              Chưa có tài khoản?{' '}
              <Link href='/register' className='underline-offset-4 hover:underline'>
                Đăng ký
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}
