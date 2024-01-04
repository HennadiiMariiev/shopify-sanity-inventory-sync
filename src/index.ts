import express from 'express';
import cors from 'cors';

import { Session } from '@shopify/shopify-api';

import { PORT } from './config/vars/envs';
import sanityService from './services/sanity.service';
import shopify, { session } from './config/shopify';

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  // const products = await sanityService.getProducts();

  // console.log('products', products?.length);
  const client = new shopify.api.clients.Graphql({
    session: session as unknown as Session,
  });

  const data = await client.query({
    data: {
      query: `
      {
        locations(first: 100) {
          nodes {
            name
          }
        }
      }
  `,
    },
  });

  console.log('data', JSON.stringify(data?.body, null, 2));

  res.send('<h1>Express + TypeScript Server!!!</h1>');
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
