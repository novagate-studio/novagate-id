import Cookies from 'universal-cookie'

const cookies = new Cookies(null, {
  path: '/',
  domain: process.env.NEXT_PUBLIC_ENVIRONMENT === 'local' ? 'localhost' : '.novagate.studio',
})

export const cookiesInstance = cookies
