import shopify, { session } from '../config/shopify';

export async function subscribeBulkOperationsWebhook() {
  const webhook = new shopify.api.rest.Webhook({ session: session });

  webhook.address = 'pubsub://projectName:topicName';
  webhook.topic = 'bulk_operations/finish';
  webhook.format = 'json';

  await webhook.save({
    update: true,
  });
}
