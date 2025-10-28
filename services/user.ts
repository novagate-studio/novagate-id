import { User } from '@/models/user'
import { ResponseData } from '.'
import axiosInstance from './axios'

export const getProfile = async (): Promise<ResponseData<User>> => {
  const response = await axiosInstance.get('/api/v2/auth/getProfile')
  return response.data
}