'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { sendOTPForVerifyPhone, verifyPhone } from '@/services/auth'
import { getCaptcha } from '@/services/captcha'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { Info, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface PhoneVerificationAlertProps {
  phone?: string
  onVerificationSuccess: () => Promise<void>
}

export function PhoneVerificationAlert({ phone, onVerificationSuccess }: PhoneVerificationAlertProps) {
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [otp, setOtp] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [captchaImage, setCaptchaImage] = useState<string>('')

  const fetchCaptcha = async () => {
    try {
      const image = await getCaptcha()
      setCaptchaImage(image)
    } catch (error) {
      toast.error('Không thể tải mã xác thực. Vui lòng thử lại.')
    }
  }

  const verifyHandler = async () => {
    try {
      const response = await sendOTPForVerifyPhone()
      await fetchCaptcha()
      if (response.code === 200) {
        setShowOTPDialog(true)
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Lỗi không xác định, vui lòng thử lại')
    }
  }

  const handleConfirmOTP = async () => {
    if (isConfirming) return
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập mã OTP hợp lệ')
      return
    }
    if (captcha.trim().length === 0) {
      toast.error('Vui lòng nhập mã xác thực')
      return
    }
    setIsConfirming(true)
    try {
      const response = await verifyPhone({
        otp,
        captcha,
      })
      if (response.code === 200) {
        toast.success('Xác thực số điện thoại thành công! Tài khoản của bạn đã được kích hoạt.')
        await onVerificationSuccess()
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Lỗi không xác định, vui lòng thử lại')
    } finally {
      setIsConfirming(false)
      setShowOTPDialog(false)
      setOtp('')
      setCaptcha('')
    }
  }

  return (
    <Alert variant='warning' className='mb-4'>
      <Info />
      <AlertTitle>Kích hoạt tài khoản!</AlertTitle>
      <AlertDescription>
        <div className='space-y-3'>
          <div>
            Vui lòng xác thực số điện thoại của bạn để bảo vệ tài khoản. Nếu số điện thoại đăng ký Zalo không đúng, vui
            lòng{' '}
            <Link href='/change-phone' className='underline font-semibold'>
              đổi tại đây
            </Link>
            .
          </div>
          <div>
            <Button onClick={verifyHandler}>Gửi mã OTP tới {phone}</Button>
            <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nhập mã OTP</DialogTitle>
                  <DialogDescription>Vui lòng nhập mã OTP đã được gửi đến Zalo của bạn.</DialogDescription>
                </DialogHeader>
                <InputOTP value={otp} onChange={setOtp} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className='space-y-2'>
                  <Label htmlFor='phone-captcha'>Mã xác thực</Label>
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
                      className='flex items-center gap-2'>
                      <RefreshCw className={cn('h-4 w-4')} />
                    </Button>
                  </div>

                  <Input
                    id='phone-captcha'
                    placeholder='Nhập mã xác thực bên trên'
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type='button' onClick={handleConfirmOTP} disabled={isConfirming}>
                    {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
