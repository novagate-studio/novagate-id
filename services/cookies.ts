import Cookies from 'universal-cookie'

const cookies = new Cookies(null, { path: '/', domain: '.novagate.studio' })

export const cookiesInstance = cookies
