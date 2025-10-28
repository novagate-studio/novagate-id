import { ResponseData } from '.'
import axiosInstance from './axios'
import { cookiesInstance } from './cookies'

export const logout = async () => {
  // Implementation of logout service
  cookiesInstance.remove('access_token')
}

export const checkUsername = async (username: string): Promise<ResponseData<any>> => {
  const response = await axiosInstance.get(`/api/v2/auth/register/checkUsername?username=${username}`)
  return response.data
}
export const checkEmail = async (email: string): Promise<ResponseData<any>> => {
  const response = await axiosInstance.get(`/api/v2/auth/register/checkEmail?email=${email}`)
  return response.data
}
export const sendOTP = async (phone: string): Promise<ResponseData<any>> => {
  const response = await axiosInstance.post(`/api/v2/auth/register/sendOtp`, { phone_number: phone })
  return response.data
}
export const registry = async (data: {
  full_name: string
  username: string
  password: string
  password_confirmation: string
  phone: string
  dob: string
  gender: string
  address: string
  email: string
  otp: string
}): Promise<ResponseData<{
  user: {
    id: string
    username: string
    status: string
    roles: string
  }
  token: string
}>> => {
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, (data as any)[key])
  }
  const response = await axiosInstance.post(`/api/v2/auth/register`, formData)
  return response.data
}
export const login = async (username: string, password: string): Promise<ResponseData<{
  user: {
    id: string
    username: string
    status: string
    roles: string
  }
  token: string
}>> => {
  const response = await axiosInstance.post(`/api/v2/auth/login`, {
    username,
    password,
  })
  return response.data
}

export const getProfile = async (): Promise<
  ResponseData<{
    id: string
    username: string
    full_name: string
    email: string
    phone: string
    dob: string
    gender: 'male' | 'female' | 'prefer-not-to-say'
    address: string
    avatar?: string
    status: string
    roles: string
    created_at: string
    updated_at: string
  }>
> => {
  const response = await axiosInstance.get('/api/v2/auth/profile')
  return response.data
}