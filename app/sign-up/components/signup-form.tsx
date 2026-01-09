'use client'
import { useRouter } from 'next/navigation'
import { useState, CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { checkEmail, checkUsername, registry, sendOTP } from '@/services/auth'
import { cookiesInstance } from '@/services/cookies'
import { zodResolver } from '@hookform/resolvers/zod'

import { DobPicker } from './dob-picker'

// Inline styles
const styles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
  tabsList: {
    display: 'flex',
    width: '100%',
    backgroundColor: '#f4f4f5',
    borderRadius: '0.375rem',
    padding: '0.25rem',
    marginBottom: '1rem',
  },
  tabTrigger: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabTriggerActive: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    color: '#18181b',
  },
  tabTriggerInactive: {
    backgroundColor: 'transparent',
    color: '#71717a',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  input: {
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
  },
  errorMessage: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#ef4444',
    margin: 0,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#18181b',
    color: '#fafafa',
    width: '100%',
  },
  buttonOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: '1px solid #e4e4e7',
    color: '#18181b',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  radioInput: {
    width: '1rem',
    height: '1rem',
    accentColor: '#18181b',
    margin: 0,
  },
  radioLabel: {
    fontSize: '0.875rem',
  },
  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContent: {
    position: 'relative',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '24rem',
    borderRadius: '0.5rem',
    border: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  dialogHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    textAlign: 'center',
  },
  dialogTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    margin: 0,
  },
  dialogDescription: {
    fontSize: '0.875rem',
    color: '#71717a',
    margin: 0,
  },
  otpContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  otpInput: {
    width: '2.5rem',
    height: '2.5rem',
    textAlign: 'center',
    fontSize: '1.25rem',
    fontWeight: 500,
    borderRadius: '0.375rem',
    border: '1px solid #e4e4e7',
    outline: 'none',
  },
  dialogFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}

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
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
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

  const watchGender = watch('gender')
  const watchDob = watch('dob')

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
    const isValid = await trigger(['fullname', 'username', 'password', 'confirmPassword'])
    if (isValid) {
      setTab('verify')
    }
  }
  const handleConfirmOTP = async () => {
    if (isConfirming) return

    setIsConfirming(true)
    try {
      const response = await registry({
        full_name: getValues('fullname'),
        username: getValues('username'),
        password: getValues('password'),
        password_confirmation: getValues('confirmPassword'),
        phone: getValues('phone'),
        dob: getValues('dob')!.toISOString(),
        gender: getValues('gender'),
        address: getValues('address'),
        email: getValues('email'),
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    const newOtp = otp.split('')
    newOtp[index] = value.toUpperCase()
    setOtp(newOtp.join(''))

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <>
      <form style={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.header}>
          <h1 style={styles.title}>Tạo tài khoản của bạn</h1>
        </div>

        {/* Tabs */}
        <div>
          <div style={styles.tabsList}>
            <button
              type='button'
              style={{
                ...styles.tabTrigger,
                ...(tab === 'info' ? styles.tabTriggerActive : styles.tabTriggerInactive),
              }}
              onClick={() => setTab('info')}>
              Thông tin đăng nhập
            </button>
            <button
              type='button'
              style={{
                ...styles.tabTrigger,
                ...(tab === 'verify' ? styles.tabTriggerActive : styles.tabTriggerInactive),
              }}
              onClick={() => setTab('verify')}>
              Xác minh
            </button>
          </div>

          {/* Tab: Info */}
          {tab === 'info' && (
            <div style={styles.fieldGroup}>
              <div style={styles.formItem}>
                <label style={styles.label}>Họ và tên</label>
                <input style={styles.input} placeholder='Nhập họ và tên của bạn' {...register('fullname')} />
                {errors.fullname && <p style={styles.errorMessage}>{errors.fullname.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Tên đăng nhập</label>
                <input
                  style={styles.input}
                  placeholder='Tên đăng nhập dài 4-32 ký tự chỉ được phép chứa chữ cái hoặc số'
                  {...register('username')}
                />
                {errors.username && <p style={styles.errorMessage}>{errors.username.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Mật khẩu</label>
                <input
                  style={styles.input}
                  type='password'
                  placeholder='Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
                  {...register('password')}
                />
                {errors.password && <p style={styles.errorMessage}>{errors.password.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Xác nhận mật khẩu</label>
                <input
                  style={styles.input}
                  type='password'
                  placeholder='Nhập lại mật khẩu của bạn'
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p style={styles.errorMessage}>{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <button type='button' style={styles.button} onClick={continueToVerification}>
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Tab: Verify */}
          {tab === 'verify' && (
            <div style={styles.fieldGroup}>
              <div style={styles.formItem}>
                <label style={styles.label}>Số điện thoại</label>
                <input
                  style={styles.input}
                  type='tel'
                  placeholder='Nhập số điện thoại đã đăng ký Zalo'
                  {...register('phone')}
                />
                {errors.phone && <p style={styles.errorMessage}>{errors.phone.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type='email' placeholder='Nhập email' {...register('email')} />
                {errors.email && <p style={styles.errorMessage}>{errors.email.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Ngày sinh</label>
                <DobPicker
                  value={watchDob}
                  onChange={(date) => setValue('dob', date || null, { shouldValidate: true })}
                />
                {errors.dob && <p style={styles.errorMessage}>{errors.dob.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Giới tính</label>
                <div style={styles.radioGroup}>
                  <div style={styles.radioItem}>
                    <input
                      type='radio'
                      id='male'
                      value='male'
                      checked={watchGender === 'male'}
                      onChange={() => setValue('gender', 'male')}
                      style={styles.radioInput}
                    />
                    <label htmlFor='male' style={styles.radioLabel}>
                      Nam
                    </label>
                  </div>
                  <div style={styles.radioItem}>
                    <input
                      type='radio'
                      id='female'
                      value='female'
                      checked={watchGender === 'female'}
                      onChange={() => setValue('gender', 'female')}
                      style={styles.radioInput}
                    />
                    <label htmlFor='female' style={styles.radioLabel}>
                      Nữ
                    </label>
                  </div>
                  <div style={styles.radioItem}>
                    <input
                      type='radio'
                      id='prefer-not-to-say'
                      value='prefer-not-to-say'
                      checked={watchGender === 'prefer-not-to-say'}
                      onChange={() => setValue('gender', 'prefer-not-to-say')}
                      style={styles.radioInput}
                    />
                    <label htmlFor='prefer-not-to-say' style={styles.radioLabel}>
                      Bí mật
                    </label>
                  </div>
                </div>
                {errors.gender && <p style={styles.errorMessage}>{errors.gender.message}</p>}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Địa chỉ</label>
                <input style={styles.input} type='text' placeholder='Nhập địa chỉ' {...register('address')} />
                {errors.address && <p style={styles.errorMessage}>{errors.address.message}</p>}
              </div>

              <div style={styles.buttonGrid}>
                <button
                  type='button'
                  style={{ ...styles.buttonOutline, opacity: isSubmitting ? 0.5 : 1 }}
                  onClick={() => setTab('info')}
                  disabled={isSubmitting}>
                  Quay lại
                </button>
                <button
                  type='submit'
                  style={{ ...styles.button, opacity: isSubmitting ? 0.5 : 1 }}
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* OTP Dialog */}
      {showOTPDialog && (
        <div style={styles.dialogOverlay} onClick={() => setShowOTPDialog(false)}>
          <div style={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.dialogHeader}>
              <h2 style={styles.dialogTitle}>Nhập mã OTP</h2>
              <p style={styles.dialogDescription}>Vui lòng nhập mã OTP đã được gửi đến Zalo của bạn.</p>
            </div>
            <div style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type='text'
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={styles.otpInput}
                />
              ))}
            </div>
            <div style={styles.dialogFooter}>
              <button
                type='button'
                style={{ ...styles.button, width: 'auto', opacity: isConfirming ? 0.5 : 1 }}
                onClick={handleConfirmOTP}
                disabled={isConfirming}>
                {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
