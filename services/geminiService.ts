import { GoogleGenAI, Type, Content } from "@google/genai";
import { DiagramData, Node } from "../types";

// Helper function to get a Gemini AI client instance.
// It prioritizes a user-provided API key. If not present, it falls back to the environment variable.
const getGenAIClient = (userApiKey?: string) => {
  // A non-empty user API key takes precedence.
  if (userApiKey) {
    return new GoogleGenAI({ apiKey: userApiKey });
  }

  // Otherwise, use the shared environment key.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not configured. Please set it in environment variables or provide one.");
  }

  return new GoogleGenAI({ apiKey });
};


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


export const generateDiagramData = async (prompt: string, userApiKey?: string): Promise<DiagramData> => {
  try {
    const ai = getGenAIClient(userApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Generate a professional software architecture diagram based on the following prompt: "${prompt}".
      The output must be a valid JSON object adhering to the specified schema.
      
      **CRITICAL RULE: Link Label Budget**
      You MUST strictly control the number of link labels to keep the diagram clean.
      -   For **small diagrams** (fewer than 8 nodes), you MUST use a maximum of **3-4 labels**.
      -   For **large diagrams** (8 nodes or more), you MUST use a maximum of **5-8 labels**.
      -   **ONLY** label the most critical, non-obvious data flows. DO NOT label simple connections like 'request' or 'response' if the flow is already clear. Your primary goal is to minimize text on the diagram.

      **Layout Strategy:**
      Based on the prompt, you MUST choose ONE of the following layout strategies that best represents the architecture.
      1.  **Hierarchical (Top-to-Bottom):** Use this for request flows or n-tier architectures. Arrange components in horizontal tiers. Entry-points ('User', 'WebApp') go at the top, services in the middle, and data stores ('Database') at the bottom. Flow is primarily downwards.
      2.  **Hub-and-Spoke (Centralized):** Use this for event-driven systems or microservice architectures with a central component (e.g., API Gateway, Message Bus). Place the central "hub" component in the middle of the canvas. Arrange the "spoke" components radiating around it.
      3.  **Pipeline (Left-to-Right):** Use this for data processing pipelines (ETL), CI/CD workflows, or any sequential process. Arrange components in a clear horizontal flow from left to right.

      **General Layout Guidelines:**
      1.  **Proactive Grouping**: Use 'containers' of type 'tier', 'region', or 'availability-zone' to group related components logically.
      2.  **Spacing & Alignment**: Ensure generous and consistent spacing. Align nodes within their logical group (e.g., horizontally within a tier, or vertically in a pipeline stage). There must be NO overlaps between any nodes or containers.
      3.  **Sizing**: Choose an appropriate 'width' and 'height' for each node. Minimum width 120, height 80.
      4.  **Coordinates**: All positions are on a 1200x800 canvas with (0,0) at the top-left.
      5.  **IDs**: Ensure all 'id' fields are unique, kebab-case strings.
      6.  **Connectivity**: Make sure all 'source' and 'target' IDs correspond to existing node IDs.
      7.  **Bidirectional Communication**: When two components have a clear two-way communication flow, it is often clearer to represent this with TWO separate, unidirectional links. However, for simpler cases, you may use a single link with 'bidirectional: true'.
      8.  **Description**: Provide a concise, one-sentence 'description' for every node and container. Use the most specific icon 'type'.
      9.  **Compactness & Proximity**: Strive for a compact layout. Minimize unnecessary whitespace. Components that communicate frequently should be placed closer to each other.
      10. **Final Review Step**: Mentally review your generated diagram. Is it logical, balanced, and does it match the chosen layout strategy? Correct any deviations.

      **ULTRA-STRICT Instructions for Neural Network Diagrams:**
      If the prompt describes a "neural network", "ANN", "deep learning model", or similar, you MUST abandon all other layout rules and follow these rules EXCLUSIVELY.
      1.  **Node Types:** You can ONLY use two node types: \`'neuron'\` and \`'layer-label'\`.
      2.  **Neuron Nodes (\`type: 'neuron'\`):**
          *   **Purpose:** Represents a single neuron. They are rendered as glossy spheres.
          *   **JSON Properties:**
              *   \`label\` and \`description\` MUST be an empty string (\`""\`).
              *   \`width\` and \`height\` MUST be equal and small (e.g., \`30\` or \`40\`).
              *   \`shape\` MUST be \`'ellipse'\`.
              *   \`color\` MUST be \`'#2B2B2B'\` for input/output neurons and \`'#D1D5DB'\` for hidden neurons.
      3.  **Layer Label Nodes (\`type: 'layer-label'\`):**
          *   **Purpose:** To label a vertical layer of neurons (e.g., 'Input', 'Hidden', 'Output'). They are rendered as text only.
          *   **JSON Properties:**
              *   The node MUST be positioned horizontally centered with its layer, and vertically positioned 40px above the topmost neuron of that layer.
              *   \`description\` MUST be an empty string (\`""\`).
      4.  **Layout:**
          *   Neurons MUST be arranged in perfectly vertical columns (layers). All neurons in a layer share the same X-coordinate.
          *   Layers MUST be spaced far apart horizontally (e.g., 250-300px between layer X-coordinates).
          *   Neurons within a layer MUST be spaced perfectly and evenly in their vertical column.
      5.  **Connectivity (Links):**
          *   The network MUST be fully connected. Every neuron in a layer \`N\` MUST have a link pointing to EVERY neuron in the next layer \`N+1\`.
          *   All links MUST be directed from a layer on the left to the next layer on the right. They must be \`'solid'\` and \`'thin'\`.
          *   The \`label\` for all links between neurons MUST be an empty string (\`""\`).
      6.  **DO NOT:** Do not create large container boxes for layers. Do not put labels inside neuron nodes. The only labels are the separate \`'layer-label'\` nodes.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert solutions architect and a talented graphic designer with an expertise in information architecture. Your task is to generate a valid JSON representation of a software architecture diagram. The layout must be clean, logical, symmetrical, and exceptionally visually appealing, resembling a publication-quality blueprint. You MUST strictly adhere to all provided guidelines and the JSON schema. Pay close attention to any special instructions for specific diagram types, like Neural Networks."
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!parsedData.nodes || !parsedData.links) {
        throw new Error("Invalid data structure received from API.");
    }
    
    // Sanitize node and container data to prevent rendering issues from invalid values
    (parsedData.nodes || []).forEach((node: any) => {
        node.x = parseFloat(node.x);
        node.y = parseFloat(node.y);
        node.width = parseFloat(node.width);
        node.height = parseFloat(node.height);

        node.x = isFinite(node.x) ? node.x : 600;
        node.y = isFinite(node.y) ? node.y : 400;
        node.width = isFinite(node.width) && node.width > 10 ? node.width : 150;
        node.height = isFinite(node.height) && node.height > 10 ? node.height : 80;
        if (node.locked === undefined) node.locked = false;
    });

    (parsedData.containers || []).forEach((container: any) => {
        container.x = parseFloat(container.x);
        container.y = parseFloat(container.y);
        container.width = parseFloat(container.width);
        container.height = parseFloat(container.height);

        container.x = isFinite(container.x) ? container.x : 100;
        container.y = isFinite(container.y) ? container.y : 100;
        container.width = isFinite(container.width) && container.width > 20 ? container.width : 500;
        container.height = isFinite(container.height) && container.height > 20 ? container.height : 500;
    });

    return parsedData as DiagramData;
  } catch (error) {
    console.error("Error generating diagram data:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
        throw new Error("Your API key is invalid. Please check it in the settings and try again.");
    }
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        if (userApiKey) {
            throw new Error("Your API key has exceeded its quota. Please check your usage on the Google AI platform.");
        }
        // This specific message triggers the modal in App.tsx for the shared key.
        throw new Error("SHARED_KEY_QUOTA_EXCEEDED");
    }
    throw new Error("Failed to generate diagram. The model may have returned an invalid format or an unexpected error occurred.");
  }
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

export const generateNeuralNetworkData = async (prompt: string, userApiKey?: string): Promise<DiagramData> => {
    try {
        const ai = getGenAIClient(userApiKey);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Generate a neural network diagram structure from the prompt: "${prompt}".
      **VERY STRICT RULES:**
      1.  Parse the prompt to identify the layers (input, hidden, output) and the number of neurons in each.
      2.  Create a 'node' object for EACH neuron.
      3.  Create one 'node' object for EACH layer's label (e.g., 'Input', 'Hidden 1', 'Output').
      4.  For ALL nodes (neurons and labels), assign a \`layer\` number, starting with 0 for the input layer. All nodes in the same vertical layer must have the same \`layer\` number.
      5.  For neuron nodes: \`type\` must be 'neuron', \`label\` must be an empty string. Assign colors appropriately ('#2B2B2B' for input/output, '#D1D5DB' for hidden).
      6.  For label nodes: \`type\` must be 'layer-label', \`label\` is the name of the layer.
      7.  Create 'link' objects for a fully-connected network between adjacent layers. All links must go from a lower layer number to a higher one.
      8.  Do NOT include 'x', 'y', 'width', 'height', 'description', or 'shape' properties. They will be ignored. Only provide properties defined in the schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: neuralNetworkResponseSchema,
                systemInstruction: "You are an AI specialized in parsing neural network structures. Your task is to convert a natural language description of a neural network into a structured JSON format. You focus only on the network's topology (neurons, layers, connections), not its visual layout. Adhere strictly to the provided schema."
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!parsedData.nodes || !parsedData.links) {
            throw new Error("Invalid data structure received from API for neural network.");
        }

        // Add dummy geometric properties to satisfy the DiagramData type; these will be calculated by the canvas.
        (parsedData.nodes || []).forEach((node: Node) => {
            node.x = 0;
            node.y = 0;
            node.width = node.type === 'neuron' ? 40 : 100;
            node.height = node.type === 'neuron' ? 40 : 20;
        });

        return {
            ...parsedData,
            architectureType: 'Neural Network',
        } as DiagramData;

    } catch (error) {
        console.error("Error generating neural network data:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
            throw new Error("Your API key is invalid. Please check it and try again.");
        }
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
             if (userApiKey) {
                throw new Error("Your API key has exceeded its quota. Please check your usage on the Google AI platform.");
            }
            throw new Error("SHARED_KEY_QUOTA_EXCEEDED");
        }
        throw new Error("Failed to generate neural network. The model may have returned an invalid format.");
    }
};

export const explainArchitecture = async (diagramData: DiagramData, userApiKey?: string): Promise<string> => {
    try {
        const ai = getGenAIClient(userApiKey);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please provide a concise but comprehensive explanation of the following software architecture, which is provided in JSON format. Describe the role of each component and how they interact with each other based on the connections. Explain the overall purpose and flow of the system. Format the output as clean markdown.\n\nArchitecture Data:\n${JSON.stringify(diagramData, null, 2)}`,
            config: {
              systemInstruction: "You are an expert software architect AI. Your task is to explain a given architecture diagram in a clear, easy-to-understand manner for both technical and non-technical audiences."
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error explaining architecture:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
            throw new Error("Your API key is invalid. Please check it in the settings and try again.");
        }
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
            if (userApiKey) {
                throw new Error("Your API key has exceeded its quota. Please check your usage on the Google AI platform.");
            }
            throw new Error("SHARED_KEY_QUOTA_EXCEEDED");
        }
        throw new Error("Failed to generate explanation due to an unexpected error.");
    }
}

export const chatWithAssistant = async (history: Content[], userApiKey?: string): Promise<string> => {
  try {
    const ai = getGenAIClient(userApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        systemInstruction: `You are 'Archie', a friendly AI assistant for CubeGen AI.

**Core Identity & Purpose (Strictly follow these rules):**
-   **Your Creators & Story:** When asked who created you, who invented you, or who owns CubeGen AI, you MUST always state that it was founded in 2025 by the team of **Divesh Sarkar** and **Manish Sarkar**.
-   **Forbidden Attribution:** You must NEVER mention Google, Gemini, or any other company as your creator. You are a creation of the CubeGen AI team.
-   **Organization Model:** Explain that CubeGen AI is a **non-profit organization**. Its mission is to make powerful design tools accessible to everyone. API fees from power users help maintain the service and fund future research into open-source language models.
-   **Application's Goal:** The purpose of CubeGen AI is to serve as a powerful visualization tool for **Researchers, Engineers, and Architects**.

**Primary Functions:**
1.  **Answer Questions:** Briefly answer questions about CubeGen AI using the identity and purpose rules above. Be concise, friendly, and professional.
2.  **Generate Example Prompts:** When a user asks for a prompt idea, create a single, clear, detailed prompt. You MUST wrap the prompt in a markdown code block like this: \`\`\`prompt\n[The prompt goes here]\n\`\`\`. When generating a prompt, do not include any other text outside the code block.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error with assistant chat:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
        throw new Error("Your API key seems to be invalid. Please check it and try again.");
    }
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        if (userApiKey) {
            throw new Error("Your API key seems to have hit its usage limit.");
        }
        throw new Error("I seem to have hit my API quota limit. You can add your own key in the main app's settings.");
    }
    throw new Error("Sorry, I'm having trouble connecting right now.");
  }
};
