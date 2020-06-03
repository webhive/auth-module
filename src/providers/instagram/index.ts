import { assignDefaults, addAuthorize } from '../../utils/provider'

export default function github (nuxt, strategy) {
  assignDefaults(strategy, {
    scheme: 'oauth2',
    endpoints: {
      authorization: 'https://api.instagram.com/oauth/authorize/',
      token: 'https://graph.instagram.com/access_token',
      userInfo: 'https://api.instagram.com/v1/users/self/',
    },
    scope: ['user_profile'],
    responseType: 'code',
    grantType: 'ig_exchange_token'
  })

  addAuthorize(nuxt, strategy)
}
