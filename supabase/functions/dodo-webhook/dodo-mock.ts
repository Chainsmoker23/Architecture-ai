// This is a mock implementation of the fictional Dodo Payments SDK for local development.
// It simulates the API calls made by the Supabase Edge Functions.

class DodoMock {
  constructor(apiKey: string) {
    if (!apiKey) {
      console.warn('DodoMock initialized without an API key.');
    }
  }

  customers = {
    create: async (params: { email: string; metadata: Record<string, any> }) => {
      console.log('[DodoMock] Creating customer:', params);
      // Generate a fake customer ID
      const customerId = `cus_mock_${Math.random().toString(36).substring(2, 15)}`;
      return Promise.resolve({
        id: customerId,
        email: params.email,
        metadata: params.metadata,
      });
    },
  };

  checkout = {
    sessions: {
      create: async (params: { customer: string; success_url: string; cancel_url: string; line_items: any[] }) => {
        console.log('[DodoMock] Creating checkout session:', params);
        // Generate a fake session ID
        const sessionId = `cs_mock_${Math.random().toString(36).substring(2, 15)}`;
        // In a real scenario, this would return a URL for redirection.
        // The function only needs the sessionId.
        return Promise.resolve({
          id: sessionId,
        });
      },
    },
  };

  webhooks = {
      constructEvent: async (payload: string, sig: string, secret: string) => {
          console.log('[DodoMock] Constructing webhook event.');
          // In a real webhook, you'd verify the signature. Here, we just parse the payload.
          // This is NOT secure and is for local testing only.
          if (!secret) {
              throw new Error('Webhook secret is missing.');
          }
          if (!sig) {
              throw new Error('Signature is missing.');
          }
          const event = JSON.parse(payload);
          console.log('[DodoMock] Mock webhook event constructed:', event.type);
          return Promise.resolve(event);
      }
  }
}

export default DodoMock;