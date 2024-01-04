import { shopifyApp } from '@shopify/shopify-app-express';

import {
  PORT,
  SCOPES,
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_API_ACCESS_TOKEN,
  SHOPIFY_DOMAIN,
} from './vars/envs';

const shopify = shopifyApp({
  api: {
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET,
    adminApiAccessToken: SHOPIFY_API_ACCESS_TOKEN,
    scopes: [SCOPES ?? ''],
    hostScheme: 'http',
    hostName: `localhost:${PORT}`,
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
});

const session = {
  accessToken: SHOPIFY_API_ACCESS_TOKEN,
  shop: SHOPIFY_DOMAIN,
};

export { session };
export default shopify;
