import axiosInstance from './axios'

// Fetch captcha image
export const getCaptcha = async (): Promise<Blob> => {
  const response = await axiosInstance.get('/api/v2/captcha', {
    responseType: 'blob',
  })
  return response.data
}
