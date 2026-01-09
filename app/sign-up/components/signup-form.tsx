'use client'
import { useRouter } from 'next/navigation'
import { useState, CSSProperties, InputHTMLAttributes, forwardRef, createContext, useContext, useId } from 'react'
import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { checkEmail, checkUsername, registry, sendOTP } from '@/services/auth'
import { cookiesInstance } from '@/services/cookies'
import { zodResolver } from '@hookform/resolvers/zod'

import { DobPicker } from './dob-picker'

// Inline styled components
const buttonBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  whiteSpace: 'nowrap',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s',
  outline: 'none',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  border: 'none',
}

const buttonPrimaryStyle: CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#18181b',
  color: '#fafafa',
}

const buttonOutlineStyle: CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: 'transparent',
  border: '1px solid #e4e4e7',
  color: '#18181b',
}

const inputStyle: CSSProperties = {
  display: 'flex',
  height: '2.5rem',
  width: '100%',
  borderRadius: '0.375rem',
  border: '1px solid #e4e4e7',
  backgroundColor: 'transparent',
  padding: '0.5rem 0.75rem',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1,
  marginBottom: '0.5rem',
  display: 'block',
}

const fieldGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const formItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
}

const formMessageStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#ef4444',
}

const tabsListStyle: CSSProperties = {
  display: 'inline-flex',
  height: '2.5rem',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.375rem',
  backgroundColor: '#f4f4f5',
  padding: '0.25rem',
  width: '100%',
  marginBottom: '1rem',
}

const tabTriggerStyle = (isActive: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  borderRadius: '0.25rem',
  padding: '0.375rem 0.75rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s',
  flex: 1,
  cursor: 'pointer',
  border: 'none',
  backgroundColor: isActive ? '#ffffff' : 'transparent',
  boxShadow: isActive ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
  color: isActive ? '#18181b' : '#71717a',
})

const dialogOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const dialogContentStyle: CSSProperties = {
  position: 'relative',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  maxWidth: '32rem',
  borderRadius: '0.5rem',
  border: '1px solid #e4e4e7',
  backgroundColor: '#ffffff',
  padding: '1.5rem',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}

const dialogHeaderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  textAlign: 'center',
}

const dialogTitleStyle: CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '-0.025em',
}

const dialogDescriptionStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: '#71717a',
}

const dialogFooterStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: '0.5rem',
}

const otpContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'center',
}

const otpInputStyle: CSSProperties = {
  width: '2.5rem',
  height: '2.5rem',
  textAlign: 'center',
  fontSize: '1.25rem',
  fontWeight: 500,
  borderRadius: '0.375rem',
  border: '1px solid #e4e4e7',
  outline: 'none',
}

const radioGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
}

const radioItemContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
}

const radioInputStyle: CSSProperties = {
  width: '1rem',
  height: '1rem',
  accentColor: '#18181b',
}

// Inline Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'default', style, disabled, ...props }, ref) => {
  const baseStyle = variant === 'outline' ? buttonOutlineStyle : buttonPrimaryStyle
  return (
    <button
      ref={ref}
      style={{
        ...baseStyle,
        ...style,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      disabled={disabled}
      {...props}
    />
  )
})
Button.displayName = 'Button'

// Inline Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ style, ...props }, ref) => (
  <input ref={ref} style={{ ...inputStyle, ...style }} {...props} />
))
Input.displayName = 'Input'

// Form Context for field state
type FormFieldContextValue = {
  name: string
}

const FormFieldContext = createContext<FormFieldContextValue | undefined>(undefined)

const FormItemContext = createContext<{ id: string } | undefined>(undefined)

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    name: fieldContext.name,
    id: itemContext?.id || '',
    ...fieldState,
  }
}

// Form Components
const Form = FormProvider

interface FormFieldProps {
  control: any
  name: string
  render: (props: { field: any }) => React.ReactElement
}

const FormField = ({ control, name, render }: FormFieldProps) => (
  <FormFieldContext.Provider value={{ name }}>
    <Controller control={control} name={name} render={({ field }) => render({ field })} />
  </FormFieldContext.Provider>
)

const FormItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const id = useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div style={{ ...formItemStyle, ...style }} {...props}>
        {children}
      </div>
    </FormItemContext.Provider>
  )
}

const FormLabel = ({ children, style, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  const { error } = useFormField()
  return (
    <label style={{ ...labelStyle, ...style, color: error ? '#ef4444' : undefined }} {...props}>
      {children}
    </label>
  )
}

const FormControl = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const FormMessage = ({ style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { error } = useFormField()
  const message = error?.message as string | undefined

  if (!message) return null

  return (
    <p style={{ ...formMessageStyle, ...style }} {...props}>
      {message}
    </p>
  )
}

// Tabs Components
interface TabsProps {
  defaultValue?: string
  value: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const TabsContext = createContext<{ value: string; setValue: (v: string) => void } | undefined>(undefined)

const Tabs = ({ value, children }: TabsProps) => {
  const [internalValue, setInternalValue] = useState(value)
  return (
    <TabsContext.Provider value={{ value: value || internalValue, setValue: setInternalValue }}>
      <div style={{ width: '100%' }}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, style }: { children: React.ReactNode; style?: CSSProperties }) => (
  <div style={{ ...tabsListStyle, ...style }}>{children}</div>
)

const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const ctx = useContext(TabsContext)
  const isActive = ctx?.value === value
  return (
    <button type='button' style={tabTriggerStyle(isActive)} onClick={() => ctx?.setValue(value)}>
      {children}
    </button>
  )
}

const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const ctx = useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div>{children}</div>
}

// Dialog Components
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null
  return (
    <div style={dialogOverlayStyle} onClick={() => onOpenChange(false)}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

const DialogContent = ({ children }: { children: React.ReactNode }) => <div style={dialogContentStyle}>{children}</div>

const DialogHeader = ({ children }: { children: React.ReactNode }) => <div style={dialogHeaderStyle}>{children}</div>

const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2 style={dialogTitleStyle}>{children}</h2>

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p style={dialogDescriptionStyle}>{children}</p>
)

const DialogFooter = ({ children }: { children: React.ReactNode }) => <div style={dialogFooterStyle}>{children}</div>

// OTP Input Component
interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  maxLength: number
}

const OTPInput = ({ value, onChange, maxLength }: OTPInputProps) => {
  const handleChange = (index: number, char: string) => {
    if (char.length > 1) char = char[0]
    const newValue = value.split('')
    newValue[index] = char.toUpperCase()
    onChange(newValue.join(''))

    // Auto focus next input
    if (char && index < maxLength - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div style={otpContainerStyle}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type='text'
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          style={otpInputStyle}
        />
      ))}
    </div>
  )
}

// RadioGroup Components
interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

const RadioGroup = ({ value, onValueChange, children }: RadioGroupProps) => (
  <div style={radioGroupStyle}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { selectedValue: value, onValueChange })
      }
      return child
    })}
  </div>
)

interface RadioGroupItemProps {
  value: string
  id: string
  selectedValue?: string
  onValueChange?: (value: string) => void
}

const RadioGroupItem = ({ value, id, selectedValue, onValueChange }: RadioGroupItemProps) => (
  <input
    type='radio'
    id={id}
    value={value}
    checked={selectedValue === value}
    onChange={() => onValueChange?.(value)}
    style={radioInputStyle}
  />
)

// Label Component
const Label = ({
  htmlFor,
  children,
  style,
}: {
  htmlFor?: string
  children: React.ReactNode
  style?: CSSProperties
}) => (
  <label htmlFor={htmlFor} style={{ fontSize: '0.875rem', ...style }}>
    {children}
  </label>
)

// FieldGroup Component
const FieldGroup = ({ children }: { children: React.ReactNode }) => <div style={fieldGroupStyle}>{children}</div>

// Field Component
const Field = ({ children }: { children: React.ReactNode }) => <div style={{ marginTop: '0.5rem' }}>{children}</div>

// Import React for cloneElement
import React from 'react'

const formSchema = z
  .object({
    fullname: z.string().min(1, {
      message: 'Họ và tên không được để trống',
    }),
    username: z
      .string()
      .min(4, {
        message: 'Tên đăng nhập phải có ít nhất 4 ký tự',
      })
      .max(32, {
        message: 'Tên đăng nhập không được vượt quá 32 ký tự',
      })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: 'Tên đăng nhập chỉ được chứa chữ cái và số',
      })
      .refine(
        async (username) => {
          try {
            const response = await checkUsername(username)
            return response.code === 200
          } catch (error) {
            return false
          }
        },
        {
          message: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác',
        }
      ),
    phone: z
      .string()
      .min(1, {
        message: 'Số điện thoại không được để trống',
      })
      .regex(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, {
        message: 'Số điện thoại không hợp lệ (VD: 0901234567, +84901234567)',
      }),
    email: z
      .string()
      .min(1, {
        message: 'Email không được để trống',
      })
      .email({
        message: 'Email không hợp lệ',
      })
      .refine(
        async (email) => {
          try {
            const response = await checkEmail(email)
            return response.code === 200
          } catch (error) {
            return false
          }
        },
        {
          message: 'Email đã được sử dụng, vui lòng sử dụng email khác',
        }
      ),
    password: z
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
    confirmPassword: z.string(),
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
      )
      .refine(
        (date) => {
          if (!date) return false
          const today = new Date()
          const age = today.getFullYear() - date.getFullYear()
          const monthDiff = today.getMonth() - date.getMonth()
          const dayDiff = today.getDate() - date.getDate()

          // Calculate exact age
          const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age

          return exactAge >= 16
        },
        {
          message: 'Bạn dưới 16 tuổi, đề nghị cha, mẹ, người giám hộ đăng ký tài khoản',
        }
      )
      .refine(
        (date) => {
          if (!date) return false
          const today = new Date()
          const age = today.getFullYear() - date.getFullYear()
          const monthDiff = today.getMonth() - date.getMonth()
          const dayDiff = today.getDate() - date.getDate()

          // Calculate exact age
          const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age

          return exactAge >= 18
        },
        {
          message: 'Bạn phải đủ 18 tuổi trở lên để đăng ký',
        }
      ),
    gender: z.enum(['male', 'female', 'prefer-not-to-say']),
    address: z
      .string()
      .min(1, {
        message: 'Địa chỉ không được để trống',
      })
      .min(5, {
        message: 'Địa chỉ phải có ít nhất 5 ký tự',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
export function SignupForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [tab, setTab] = useState<'info' | 'verify'>('info')
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      username: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: null,
      gender: 'prefer-not-to-say',
      address: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await sendOTP(values.phone)
      if (response.code === 200) {
        setShowOTPDialog(true)
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Lỗi không xác định, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }
  const continueToVerification = async () => {
    const isValid = await form.trigger(['fullname', 'username', 'password', 'confirmPassword'])
    if (isValid) {
      setTab('verify')
    }
  }
  const handleConfirmOTP = async () => {
    if (isConfirming) return

    setIsConfirming(true)
    try {
      const response = await registry({
        full_name: form.getValues('fullname'),
        username: form.getValues('username'),
        password: form.getValues('password'),
        password_confirmation: form.getValues('confirmPassword'),
        phone: form.getValues('phone'),
        dob: form.getValues('dob')!.toISOString(),
        gender: form.getValues('gender'),
        address: form.getValues('address'),
        email: form.getValues('email'),
        otp: otp,
      })
      if (response.code === 200) {
        toast.success('Đăng ký thành công!')
        cookiesInstance.set('access_token', response.data.token)
        router.push('/')
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Lỗi không xác định, vui lòng thử lại')
    } finally {
      setIsConfirming(false)
      setShowOTPDialog(false)
      setOtp('')
    }
  }

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  }

  return (
    <>
      <Form {...form}>
        <form style={formStyle} onSubmit={form.handleSubmit(onSubmit)}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              textAlign: 'center',
            }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tạo tài khoản của bạn</h1>
          </div>
          <Tabs defaultValue='info' value={tab} onValueChange={() => {}}>
            <TabsList>
              <TabsTrigger value='info'>Thông tin đăng nhập</TabsTrigger>
              <TabsTrigger value='verify'>Xác minh</TabsTrigger>
            </TabsList>
            <TabsContent value='info'>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name='fullname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập họ và tên của bạn' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Tên đăng nhập dài 4-32 ký tự chỉ được phép chứa chữ cái hoặc số'
                          {...field}
                        />
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
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='Nhập lại mật khẩu của bạn' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type='button' onClick={continueToVerification}>
                    Tiếp tục
                  </Button>
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value='verify'>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input type='tel' placeholder='Nhập số điện thoại đã đăng ký Zalo' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='Nhập email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange}>
                          <div style={radioItemContainerStyle}>
                            <RadioGroupItem value='male' id='male' />
                            <Label htmlFor='male'>Nam</Label>
                          </div>
                          <div style={radioItemContainerStyle}>
                            <RadioGroupItem value='female' id='female' />
                            <Label htmlFor='female'>Nữ</Label>
                          </div>
                          <div style={radioItemContainerStyle}>
                            <RadioGroupItem value='prefer-not-to-say' id='prefer-not-to-say' />
                            <Label htmlFor='prefer-not-to-say'>Bí mật</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input type='text' placeholder='Nhập địa chỉ' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Button variant='outline' onClick={() => setTab('info')} disabled={isSubmitting}>
                    Quay lại
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
                  </Button>
                </div>
              </FieldGroup>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập mã OTP</DialogTitle>
            <DialogDescription>Vui lòng nhập mã OTP đã được gửi đến Zalo của bạn.</DialogDescription>
          </DialogHeader>
          <OTPInput value={otp} onChange={setOtp} maxLength={6} />
          <DialogFooter>
            <Button type='button' onClick={handleConfirmOTP} disabled={isConfirming}>
              {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
