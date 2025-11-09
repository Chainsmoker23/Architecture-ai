// Use namespaced express types to avoid collision with global Request/Response types.
// FIX: Changed import to bring in Request and Response types directly
import express, { Request, Response } from 'express';
import crypto from 'crypto';
// FIX: Import `User` type from supabase to resolve type inference issues.
import { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseClient';
import { DodoPayments, mockSessions } from './dodo-payments';
import { GoogleGenAI, Type, Content } from "@google/genai";
import { authenticateUser, checkAndIncrementGenerationCount } from './userUtils';

const router = express.Router();
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY!;
const SITE_URL = process.env.SITE_URL!;
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET!;

const dodo = new DodoPayments(DODO_SECRET_KEY);


// --- ROUTES ---

// Endpoint to serve the realistic mock payment page
// FIX: Used imported Request and Response types
router.get('/mock-payment', (req: Request, res: Response) => {
    const { sessionId } = req.query;
    if (typeof sessionId !== 'string' || !mockSessions.has(sessionId)) {
        return res.status(404).send('Session not found or has expired.');
    }
    const session = mockSessions.get(sessionId);
    res.send(dodo.getPaymentPage(sessionId, session));
});

// Endpoint to handle the form submission from the mock payment page
// FIX: Used imported Request and Response types
router.post('/confirm-payment', express.urlencoded({ extended: false }), async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    if (typeof sessionId !== 'string' || !mockSessions.has(sessionId)) {
        return res.status(404).send('Session not found or has expired.');
    }
    const session = mockSessions.get(sessionId);

    // Trigger the webhook simulation
    await dodo.simulateWebhook(sessionId, session.customer, session.line_items);

    // Clean up the mock session
    mockSessions.delete(sessionId);
    
    // Redirect back to the app's success URL
    res.redirect(303, session.success_url);
});

// Endpoint to handle incoming webhooks from Dodo Payments
// FIX: Used imported Request and Response types
router.post('/dodo-webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const signature = req.headers['dodo-signature'];

    if (!signature || typeof signature !== 'string') {
        console.warn('[Backend] Webhook Error: Missing signature header.');
        return res.status(400).send('Webhook Error: Missing signature.');
    }

    try {
        // FIX: Corrected crypto algorithm from 'sha265' to 'sha256'.
        const expectedSignature = crypto
            .createHmac('sha256', DODO_WEBHOOK_SECRET)
            .update(req.body)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            console.warn('[Backend] Webhook Error: Invalid signature.');
            return res.status(400).send('Webhook Error: Invalid signature.');
        }
    } catch (err) {
        console.error('[Backend] Webhook Error: Signature verification failed.', err);
        return res.status(400).send('Webhook Error: Invalid signature format.');
    }

    const event = JSON.parse(req.body.toString());
    console.log('[Backend] Webhook received and signature verified:', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerId = session.customer;
        const priceId = session.line_items?.data[0]?.price;

        let plan = 'free';
        if (priceId === 'dodo_price_hobby') plan = 'hobbyist';
        if (priceId === 'dodo_price_pro') plan = 'pro';
        if (priceId === 'dodo_price_biz') plan = 'business';
        
        console.log(`[Backend] Attempting to update user with Dodo customer ID: ${customerId} to plan: ${plan}`);

        const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError || !data) {
            console.error('[Backend] Webhook Error: Could not list users:', listError);
            return res.status(500).send({ error: 'Webhook Error: Could not list users.', details: listError });
        }

        // FIX: Cast `data.users` to `User[]` to fix type inference issue where `u` was incorrectly typed as `never`.
        const user = (data.users as User[]).find(u => u.user_metadata?.dodo_customer_id === customerId);

        if (!user) {
            console.error('[Backend] Webhook Error: Could not find user for customer ID:', customerId);
            return res.status(404).send({ error: 'Webhook Error: User not found.' });
        }

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
// FIX: Safely spread `user.user_metadata` which can be null or undefined, preventing a runtime error.
            { user_metadata: { ...(user.user_metadata || {}), plan } }
        );

        if (updateError) {
             console.error('[Backend] Webhook Error: Failed to update user plan:', updateError);
             return res.status(500).send({ error: 'Webhook Error: Failed to update user plan.', details: updateError });
        }
        
        console.log(`[Backend] Successfully updated user ${updatedUser.user.id} to plan "${plan}".`);
    }
    
    res.status(200).send({ received: true });
});

// Endpoint for the frontend to create a new checkout session
// FIX: Used imported Request and Response types
router.post('/create-checkout-session', express.json(), async (req: Request, res: Response) => {
    const { priceId } = req.body;
    const user = await authenticateUser(req);
    
    if (!user) {
        return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
    }

    console.log(`[Backend] User ${user.email} authenticated for checkout.`);

    try {
        let dodoCustomerId = user.user_metadata.dodo_customer_id;

        if (!dodoCustomerId) {
            console.log(`[Backend] No Dodo customer ID found for ${user.email}. Creating one.`);
            const customer = await dodo.customers.create({
                email: user.email,
                name: user.user_metadata.full_name,
            });
            dodoCustomerId = customer.id;
            
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { user_metadata: { ...user.user_metadata, dodo_customer_id: dodoCustomerId } }
            );

            if (updateError) {
                console.error('[Backend] Failed to save new Dodo customer ID to user profile:', updateError.message);
                return res.status(500).send({ error: 'Failed to update user profile.' });
            }
             console.log(`[Backend] Saved new Dodo customer ID ${dodoCustomerId} for user ${user.id}.`);
        } else {
             console.log(`[Backend] Found existing Dodo customer ID ${dodoCustomerId} for user ${user.id}.`);
        }

        const cleanSiteUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;

        let plan = 'free';
        if (priceId === 'dodo_price_hobby') plan = 'hobbyist';
        if (priceId === 'dodo_price_pro') plan = 'pro';
        if (priceId === 'dodo_price_biz') plan = 'business';
        
        const session = await dodo.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: priceId === 'dodo_price_hobby' ? 'payment' : 'subscription',
            success_url: `${cleanSiteUrl}/#sdk?payment=success&plan=${plan}`,
            cancel_url: `${cleanSiteUrl}/#sdk?payment=cancelled`,
            customer: dodoCustomerId,
        });

        res.send({ redirectUrl: session.url });
    } catch (error: any) {
        console.error('[Backend] Error in /create-checkout-session:', error.message);
        res.status(500).send({ error: 'Internal server error.' });
    }
});


// --- NEW GEMINI API PROXY ROUTES ---

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise title for the architecture diagram." },
    architectureType: { type: Type.STRING, description: "The main architecture category (e.g., AWS, GCP, Azure, Microservices)." },
    nodes: {
      type: Type.ARRAY,
      description: "A list of all components in the architecture.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique, kebab-case identifier for the node (e.g., 'web-server-1')." },
          label: { type: Type.STRING, description: "The human-readable name of the component (e.g., 'EC2 Instance')." },
          type: { type: Type.STRING, description: "The type of component for icon mapping. Use one of the predefined types like 'aws-ec2', 'user', 'database', 'neuron', 'layer-label', 'group-label'." },
          description: { type: Type.STRING, description: "A brief, one-sentence description of the node's purpose. For 'neuron', 'layer-label', or 'group-label' types, this can be an empty string." },
          shape: { type: Type.STRING, description: "Optional. The visual shape of the node. Can be 'rectangle', 'ellipse', or 'diamond'. Defaults to 'rectangle'."},
          x: { type: Type.NUMBER, description: "The initial horizontal position of the node's center on a 1200x800 canvas." },
          y: { type: Type.NUMBER, description: "The initial vertical position of the node's center." },
          width: { type: Type.NUMBER, description: "The initial width of the node. For 'neuron' type, this should be small (e.g., 30). For 'layer-label' this should be wide enough for the text." },
          height: { type: Type.NUMBER, description: "The initial height of the node. For 'neuron' type, this should be small (e.g., 30). For 'layer-label' this can be small (e.g., 20)." },
          color: { type: Type.STRING, description: "Optional hex color code for the node. For 'neuron' type, use '#2B2B2B' for input/output layers and '#D1D5DB' for hidden layers." },
        },
        required: ["id", "label", "type", "description", "x", "y", "width", "height"],
      },
    },
    links: {
      type: Type.ARRAY,
      description: "A list of connections between the components.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique, kebab-case identifier for the link (e.g., 'user-to-lb-1')." },
          source: { type: Type.STRING, description: "The 'id' of the source node." },
          target: { type: Type.STRING, description: "The 'id' of the target node." },
          label: { type: Type.STRING, description: "Optional label for the connection to indicate data flow (e.g., 'HTTP Request')." },
          style: { type: Type.STRING, description: "The line style. Can be 'solid', 'dotted', 'dashed', or 'double'." },
          thickness: { type: Type.STRING, description: "The thickness of the link. Can be 'thin', 'medium', or 'thick'." },
          bidirectional: { type: Type.BOOLEAN, description: "If true, the link will have arrowheads on both ends." },
        },
        required: ["id", "source", "target"],
      },
    },
    containers: {
      type: Type.ARRAY,
      description: "A list of bounding boxes for logical groupings like tiers, regions, or availability zones.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique, kebab-case identifier for the container." },
          label: { type: Type.STRING, description: "The human-readable name of the container (e.g., 'Web Tier')." },
          type: { type: Type.STRING, description: "The type of container. Must be one of: 'region', 'availability-zone', 'tier'." },
          description: { type: Type.STRING, description: "A brief, one-sentence description of the container's purpose." },
          x: { type: Type.NUMBER, description: "The horizontal position of the container's top-left corner on a 1200x800 canvas." },
          y: { type: Type.NUMBER, description: "The vertical position of the container's top-left corner." },
          width: { type: Type.NUMBER, description: "The width of the container." },
          height: { type: Type.NUMBER, description: "The height of the container." },
          childNodeIds: {
            type: Type.ARRAY, description: "An array of node 'id's that are located inside this container.",
            items: { type: Type.STRING },
          },
        },
        required: ["id", "label", "type", "description", "x", "y", "width", "height", "childNodeIds"],
      }
    }
  },
  required: ["title", "architectureType", "nodes", "links"],
};

const neuralNetworkResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise title for the neural network diagram." },
    nodes: {
      type: Type.ARRAY,
      description: "A list of all neurons and layer labels.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique, kebab-case identifier." },
          label: { type: Type.STRING, description: "The label for the node. For 'neuron' type, this MUST be an empty string. For 'layer-label' type, this is the name of the layer (e.g., 'Input Layer')." },
          type: { type: Type.STRING, description: "Either 'neuron' or 'layer-label'." },
          layer: { type: Type.NUMBER, description: "The 0-indexed layer number this node belongs to. Input layer is 0." },
          color: { type: Type.STRING, description: "Optional. For 'neuron' type, use '#2B2B2B' for input/output layers and '#D1D5DB' for hidden layers." },
        },
        required: ["id", "label", "type", "layer"],
      },
    },
    links: {
      type: Type.ARRAY,
      description: "A list of connections between the neurons.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique, kebab-case identifier for the link." },
          source: { type: Type.STRING, description: "The 'id' of the source neuron." },
          target: { type: Type.STRING, description: "The 'id' of the target neuron." },
        },
        required: ["id", "source", "target"],
      },
    },
  },
  required: ["title", "nodes", "links"],
};

const getGenAIClient = (userApiKey?: string) => {
  const apiKey = userApiKey || process.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured on the server.");
  }
  return new GoogleGenAI({ apiKey });
};

const handleGeminiError = (error: unknown, res: Response, userApiKey?: string) => {
    console.error("[Backend] Gemini API Error:", String(error));
    const errorMessage = error instanceof Error ? error.message : String(error);
    let clientMessage = "Failed to process request. The model may have returned an invalid format or an unexpected error occurred.";

    if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
        clientMessage = "Your API key is invalid. Please check it in the settings and try again.";
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        clientMessage = userApiKey 
            ? "Your API key has exceeded its quota. Please check your usage on the Google AI platform."
            : "SHARED_KEY_QUOTA_EXCEEDED";
    }
    
    res.status(500).json({ error: clientMessage });
};

const generationEndpoint = async (req: Request, res: Response, schema: any, modelPrompt: string) => {
    const { prompt, userApiKey } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const user = await authenticateUser(req);
    
    if (user) {
        const usageCheck = await checkAndIncrementGenerationCount(user);
        if (!usageCheck.allowed) {
            return res.status(403).json({ error: usageCheck.error });
        }
    }

    try {
        const ai = getGenAIClient(userApiKey);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: modelPrompt.replace('${prompt}', prompt),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are an expert solutions architect and a talented graphic designer with an expertise in information architecture. Your task is to generate a valid JSON representation of a software architecture diagram. The layout must be clean, logical, symmetrical, and exceptionally visually appealing, resembling a publication-quality blueprint. You MUST strictly adhere to all provided guidelines and the JSON schema. Pay close attention to any special instructions for specific diagram types, like Neural Networks."
            },
        });
        const text = response.text;
        if (!text) {
            console.error("[Backend] Gemini API Error: Model returned no text.");
            return res.status(500).json({ error: "The AI model returned an empty or invalid response. This may be due to content filtering or a temporary issue. Please try a different prompt." });
        }

        const jsonText = text.trim();
        const parsedData = JSON.parse(jsonText);

        res.json(parsedData);
    } catch (error) {
        handleGeminiError(error, res, userApiKey);
    }
}

// FIX: Used imported Request and Response types
router.post('/api/generate-diagram', express.json(), async (req: Request, res: Response) => {
    const modelPrompt = `Generate a professional software architecture diagram based on the following prompt: "${'${prompt}'}". The output must be a valid JSON object adhering to the specified schema. **CRITICAL RULE: Link Label Budget** You MUST strictly control the number of link labels to keep the diagram clean. - For **small diagrams** (fewer than 8 nodes), you MUST use a maximum of **3-4 labels**. - For **large diagrams** (8 nodes or more), you MUST use a maximum of **5-8 labels**. - **ONLY** label the most critical, non-obvious data flows. DO NOT label simple connections like 'request' or 'response' if the flow is already clear. Your primary goal is to minimize text on the diagram. **Layout Strategy:** Based on the prompt, you MUST choose ONE of the following layout strategies that best represents the architecture. 1. **Hierarchical (Top-to-Bottom):** Use this for request flows or n-tier architectures. Arrange components in horizontal tiers. Entry-points ('User', 'WebApp') go at the top, services in the middle, and data stores ('Database') at the bottom. Flow is primarily downwards. 2. **Hub-and-Spoke (Centralized):** Use this for event-driven systems or microservice architectures with a central component (e.g., API Gateway, Message Bus). Place the central "hub" component in the middle of the canvas. Arrange the "spoke" components radiating around it. 3. **Pipeline (Left-to-Right):** Use this for data processing pipelines (ETL), CI/CD workflows, or any sequential process. Arrange components in a clear horizontal flow from left to right. **General Layout Guidelines:** 1. **Proactive Grouping**: Use 'containers' of type 'tier', 'region', or 'availability-zone' to group related components logically. 2. **Spacing & Alignment**: Ensure generous and consistent spacing. Align nodes within their logical group (e.g., horizontally within a tier, or vertically in a pipeline stage). There must be NO overlaps between any nodes or containers. 3. **Sizing**: Choose an appropriate 'width' and 'height' for each node. Minimum width 120, height 80. 4. **Coordinates**: All positions are on a 1200x800 canvas with (0,0) at the top-left. 5. **IDs**: Ensure all 'id' fields are unique, kebab-case strings. 6. **Connectivity**: Make sure all 'source' and 'target' IDs correspond to existing node IDs. 7. **Bidirectional Communication**: When two components have a clear two-way communication flow, it is often clearer to represent this with TWO separate, unidirectional links. However, for simpler cases, you may use a single link with 'bidirectional: true'. 8. **Description**: Provide a concise, one-sentence 'description' for every node and container. Use the most specific icon 'type'. 9. **Compactness & Proximity**: Strive for a compact layout. Minimize unnecessary whitespace. Components that communicate frequently should be placed closer to each other. 10. **Final Review Step**: Mentally review your generated diagram. Is it logical, balanced, and does it match the chosen layout strategy? Correct any deviations. **ULTRA-STRICT Instructions for Neural Network Diagrams:** If the prompt describes a "neural network", "ANN", "deep learning model", or similar, you MUST abandon all other layout rules and follow these rules EXCLUSIVELY. 1. **Node Types:** You can ONLY use two node types: \`'neuron'\` and \`'layer-label'\`. 2. **Neuron Nodes (\`type: 'neuron'\`):** * **Purpose:** Represents a single neuron. They are rendered as glossy spheres. * **JSON Properties:** \`label\` and \`description\` MUST be an empty string (\`""\`). \`width\` and \`height\` MUST be equal and small (e.g., \`30\` or \`40\`). \`shape\` MUST be \`'ellipse'\`. \`color\` MUST be \`'#2B2B2B'\` for input/output neurons and \`'#D1D5DB'\` for hidden neurons. 3. **Layer Label Nodes (\`type: 'layer-label'\`):** * **Purpose:** To label a vertical layer of neurons (e.g., 'Input', 'Hidden', 'Output'). They are rendered as text only. * **JSON Properties:** The node MUST be positioned horizontally centered with its layer, and vertically positioned 40px above the topmost neuron of that layer. \`description\` MUST be an empty string (\`""\`). 4. **Layout:** * Neurons MUST be arranged in perfectly vertical columns (layers). All neurons in a layer share the same X-coordinate. * Layers MUST be spaced far apart horizontally (e.g., 250-300px between layer X-coordinates). * Neurons within a layer MUST be spaced perfectly and evenly in their vertical column. 5. **Connectivity (Links):** * The network MUST be fully connected. Every neuron in a layer \`N\` MUST have a link pointing to EVERY neuron in the next layer \`N+1\`. * All links MUST be directed from a layer on the left to the next layer on the right. They must be \`'solid'\` and \`'thin'\`. * The \`label\` for all links between neurons MUST be an empty string (\`""\`). 6. **DO NOT:** Do not create large container boxes for layers. Do not put labels inside neuron nodes. The only labels are the separate \`'layer-label'\` nodes.`;
    await generationEndpoint(req, res, responseSchema, modelPrompt);
});

// FIX: Used imported Request and Response types
router.post('/api/generate-neural-network', express.json(), async (req: Request, res: Response) => {
    const modelPrompt = `Generate a neural network diagram structure from the prompt: "${'${prompt}'}". **VERY STRICT RULES:** 1. Parse the prompt to identify the layers (input, hidden, output) and the number of neurons in each. 2. Create a 'node' object for EACH neuron. 3. Create one 'node' object for EACH layer's label (e.g., 'Input', 'Hidden 1', 'Output'). 4. For ALL nodes (neurons and labels), assign a \`layer\` number, starting with 0 for the input layer. All nodes in the same vertical layer must have the same \`layer\` number. 5. For neuron nodes: \`type\` must be 'neuron', \`label\` must be an empty string. Assign colors appropriately ('#2B2B2B' for input/output, '#D1D5DB' for hidden). 6. For label nodes: \`type\` must be 'layer-label', \`label\` is the name of the layer. 7. Create 'link' objects for a fully-connected network between adjacent layers. All links must go from a lower layer number to a higher one. 8. Do NOT include 'x', 'y', 'width', 'height', 'description', or 'shape' properties. They will be ignored. Only provide properties defined in the schema.`;
    await generationEndpoint(req, res, neuralNetworkResponseSchema, modelPrompt);
});

// FIX: Used imported Request and Response types
router.post('/api/explain-architecture', express.json(), async (req: Request, res: Response) => {
    const { diagramData, userApiKey } = req.body;
    if (!diagramData) return res.status(400).json({ error: 'Diagram data is required.' });
    
    try {
        const ai = getGenAIClient(userApiKey);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please provide a concise but comprehensive explanation of the following software architecture, which is provided in JSON format. Describe the role of each component and how they interact with each other based on the connections. Explain the overall purpose and flow of the system. Format the output as clean markdown.\n\nArchitecture Data:\n${JSON.stringify(diagramData, null, 2)}`,
            config: {
              systemInstruction: "You are an expert software architect AI. Your task is to explain a given architecture diagram in a clear, easy-to-understand manner for both technical and non-technical audiences."
            }
        });
        res.json({ explanation: response.text ?? '' });
    } catch (error) {
        handleGeminiError(error, res, userApiKey);
    }
});

// FIX: Used imported Request and Response types
router.post('/api/chat', express.json(), async (req: Request, res: Response) => {
    const { history, userApiKey } = req.body;
    if (!history) return res.status(400).json({ error: 'Chat history is required.' });

    try {
        const ai = getGenAIClient(userApiKey);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                systemInstruction: `You are 'Archie', a friendly AI assistant for CubeGen AI. **Core Identity & Purpose (Strictly follow these rules):** - **Your Creators & Story:** When asked who created you, who invented you, or who owns CubeGen AI, you MUST always state that it was founded in 2025 by the team of **Divesh Sarkar** and **Manish Sarkar**. - **Forbidden Attribution:** You must NEVER mention Google, Gemini, or any other company as your creator. You are a creation of the CubeGen AI team. - **Organization Model:** Explain that CubeGen AI is a **non-profit organization**. Its mission is to make powerful design tools accessible to everyone. API fees from power users help maintain the service and fund future research into open-source language models. - **Application's Goal:** The purpose of CubeGen AI is to serve as a powerful visualization tool for **Researchers, Engineers, and Architects**. **Primary Functions:** 1. **Answer Questions:** Briefly answer questions about CubeGen AI using the identity and purpose rules above. Be concise, friendly, and professional. 2. **Generate Example Prompts:** When a user asks for a prompt idea, create a single, clear, detailed prompt. You MUST wrap the prompt in a markdown code block like this: \`\`\`prompt\n[The prompt goes here]\n\`\`\`. When generating a prompt, do not include any other text outside the code block.`
            }
        });
        res.json({ response: response.text ?? '' });
    } catch(error) {
        handleGeminiError(error, res, userApiKey);
    }
});

export default router;