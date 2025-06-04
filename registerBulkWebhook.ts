// registerBulkWebhook.ts

interface RegisterWebhookParams {
  shop: string
  accessToken: string
  callbackUrl?: string
}

interface WebhookResponse {
  webhookSubscription?: { id: string }
  userErrors?: Array<{ field: string; message: string }>
}

interface ShopifyResponse {
  data: {
    webhookSubscriptionCreate: WebhookResponse
  }
  errors?: Array<{ message: string }>
}

export async function registerBulkWebhook(
  params: RegisterWebhookParams,
): Promise<WebhookResponse> {
  const {
    shop,
    accessToken,
    callbackUrl = 'https://your-domain.com/bulk-finish',
  } = params

  // Build the GraphQL mutation
  const mutation = `
    mutation {
      webhookSubscriptionCreate(
        topic: BULK_OPERATIONS_FINISH
        webhookSubscription: {
          format: JSON
          callbackUrl: "${callbackUrl}"
        }
      ) {
        webhookSubscription { id }
        userErrors { field message }
      }
    }`

  try {
    // Fire the call to the Shopify Admin API
    const response = await fetch(
      `https://${shop}.myshopify.com/admin/api/2025-04/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken, // must include write_webhooks scope
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ShopifyResponse = await response.json()

    if (result.errors) {
      throw new Error(
        `GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`,
      )
    }

    return result.data.webhookSubscriptionCreate
  } catch (error) {
    console.error('Error registering bulk webhook:', error)
    throw error
  }
}

// Example usage (uncomment to test)
/*
const main = async () => {
  try {
    const result = await registerBulkWebhook({
      shop: "your-shop-name",
      accessToken: "your-access-token",
      callbackUrl: "https://your-domain.com/bulk-finish"
    });
    
    console.log('Webhook registered successfully:', result);
  } catch (error) {
    console.error('Failed to register webhook:', error);
  }
};

// Uncomment to run directly with: bun run registerBulkWebhook.ts
// main();
*/
