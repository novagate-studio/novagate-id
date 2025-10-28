export interface ResponseData<T> {
  status: boolean
  message:
    | 'error'
    | {
        en: string
        vi: string
      }
  code: number
  data: T
  errors?: {
    en: string
    vi: string
  }
}
