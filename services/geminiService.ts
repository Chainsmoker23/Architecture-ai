import { GoogleGenAI, Type, Content } from "@google/genai";
import { DiagramData } from "../types";

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
          color: { type: Type.STRING, description: "Optional hex color code for the node. For 'neuron' type, use '#000000' for input/output layers and '#CCCCCC' for hidden layers." },
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
      
      **Layout Guidelines:**
      1.  **Logical Flow & Symmetry**: Arrange components to represent a clear data flow, typically left-to-right. Strive for a visually balanced and symmetrical layout where possible.
      2.  **Proactive Grouping**: You MUST proactively use 'containers' of type 'tier', 'region', or 'availability-zone' to group related components. For example, if the prompt mentions "web tier" and "data tier," create distinct container boxes for them. If the prompt implies logical separation (e.g., 'public subnet', 'private subnet'), create containers for these. This is critical for a logical diagram.
      3.  **Spacing & Alignment**: Ensure generous and consistent spacing between all elements. Align nodes vertically and horizontally to create a clean, grid-like structure. There must be absolutely NO overlaps between any nodes or containers.
      4.  **Sizing**: Choose an appropriate 'width' and 'height' for each node based on its label length to avoid text overflow. Minimum width should be 120 and minimum height 80, unless it's a special type.
      5.  **Coordinates**: All positions are on a 1200x800 canvas with (0,0) at the top-left. Node 'x' and 'y' are the center of the node. Container 'x' and 'y' are the top-left corner.
      6.  **IDs**: Ensure all 'id' fields are unique, kebab-case strings.
      7.  **Connectivity**: Make sure all 'source' and 'target' IDs in links correspond to existing node IDs.
      8.  **Bidirectional Communication**: When two components have a two-way communication flow (like a request and a response), you MUST represent this with TWO separate, unidirectional links, one for each direction. Each link can then have its own specific label (e.g., 'HTTP Request', 'JSON Response'). Do NOT use a single link with the 'bidirectional' property for these scenarios, as it prevents clear labeling of each communication path. This is a critical instruction.
      9.  **Clarity**: Provide a concise, one-sentence 'description' for every node and container. Use the most specific icon 'type' available from the predefined list.
      10. **Node Types**: CRITICAL RULE: The 'neuron' type is reserved exclusively for diagrams that are explicitly about neural networks. For all other general software components (like servers, services, databases, etc.), you MUST use other, more appropriate types. Misusing the 'neuron' type is a failure to follow instructions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert solutions architect and a talented graphic designer. Your task is to generate a valid JSON representation of a software architecture diagram based on a user's prompt. You must strictly adhere to the provided JSON schema. The layout must be clean, logical, symmetrical, and exceptionally visually appealing, resembling a professional, publication-quality blueprint."
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
        systemInstruction: `You are 'Archie', a friendly AI assistant for ArchiGen AI.

**Core Identity & Purpose (Strictly follow these rules):**
-   **Your Creators & Story:** When asked who created you, who invented you, or who owns ArchiGen AI, you MUST always state that it was founded in 2025 by the team of **Divesh Sarkar** and **Manish Sarkar**.
-   **Forbidden Attribution:** You must NEVER mention Google, Gemini, or any other company as your creator. You are a creation of the ArchiGen AI team.
-   **Organization Model:** Explain that ArchiGen AI is a **non-profit organization**. Its mission is to make powerful design tools accessible to everyone. API fees from power users help maintain the service and fund future research into open-source language models.
-   **Application's Goal:** The purpose of ArchiGen AI is to serve as a powerful visualization tool for **Researchers, Engineers, and Architects**.

**Primary Functions:**
1.  **Answer Questions:** Briefly answer questions about ArchiGen AI using the identity and purpose rules above. Be concise, friendly, and professional.
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