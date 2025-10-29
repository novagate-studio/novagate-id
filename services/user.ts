import { User } from '@/models/user'
import { ResponseData } from '.'
import axiosInstance from './axios'

export const getProfile = async (): Promise<ResponseData<User>> => {
  const response = await axiosInstance.get('/api/v2/auth/getProfile')
  return response.data
}

export const addIdentifyDocument = async (document: {
  document_number: string
  document_type: string
  place_of_issue: string
  issue_date: string
}): Promise<ResponseData<User>> => {
  const response = await axiosInstance.post('/api/v2/auth/addIdentifyDocument', document)
  return response.data
}
