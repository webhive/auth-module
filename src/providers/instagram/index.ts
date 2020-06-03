import axios from 'axios'
import bodyParser from 'body-parser'

import { assignDefaults } from '../../utils/provider'

function addAuthorize (nuxt, strategy) {
  // Get clientSecret, clientId, endpoints.token and audience
  const clientSecret = strategy.clientSecret
  const clientID = strategy.clientId
  const tokenEndpoint = strategy.endpoints.token
  const audience = strategy.audience

  // IMPORTANT: remove clientSecret from generated bundle
  delete strategy.clientSecret

  // Endpoint
  const endpoint = `/_auth/oauth/${strategy.name}/authorize`
  strategy.endpoints.token = endpoint

  // Set response_type to code
  strategy.responseType = 'code'

  // Form data parser
  const formMiddleware = bodyParser.urlencoded({ extended: true })

  // Register endpoint
  nuxt.options.serverMiddleware.unshift({
    path: endpoint,
    handler: (req, res, next) => {

      formMiddleware(req, res, () => {
        const {
          code,
          redirect_uri: redirectUri = strategy.redirectUri,
          response_type: responseType = strategy.responseType,
          grant_type: grantType = strategy.grantType,
          refresh_token: refreshToken
        } = req.body

        // Grant type is authorization code, but code is not available
        if (grantType === 'authorization_code' && !code) {
          return next()
        }

        // Grant type is refresh token, but refresh token is not available
        if (grantType === 'refresh_token' && !refreshToken) {
          return next()
        }

        axios
          .request({
            method: 'post',
            url: tokenEndpoint,
            data: {
              client_id: clientID,
              client_secret: clientSecret,
              refresh_token: refreshToken,
              grant_type: grantType,
              response_type: responseType,
              redirect_uri: redirectUri,
              audience,
              code
            },
            headers: {
              Accept: 'application/json'
            }
          })
          .then((response) => {
            res.end(JSON.stringify(response.data))
          })
          .catch((error) => {
            res.statusCode = error.response.status
            res.end(JSON.stringify(error.response.data))
          })
      })
    }
  })
}

export default function github (nuxt, strategy) {
  assignDefaults(strategy, {
    scheme: 'oauth2',
    endpoints: {
      authorization: 'https://api.instagram.com/oauth/authorize/',
      token: 'https://api.instagram.com/oauth/access_token',
      userInfo: 'https://api.instagram.com/v1/users/self/',
    },
    scope: ['user_profile'],
    responseType: 'code',
    grantType: 'ig_exchange_token'
  })

  addAuthorize(nuxt, strategy)
}
