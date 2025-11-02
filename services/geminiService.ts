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
      
      **GENERAL RULES:**
      1.  **Aesthetic Layout Principles**:
          *   **Clarity and Flow**: Arrange components to represent a clear, logical data flow, typically from left-to-right or top-to-bottom.
          *   **Symmetry and Balance**: Strive for a balanced and symmetrical layout. Align nodes both vertically and horizontally to create a clean, grid-like structure.
          *   **Grouping**: Use 'containers' effectively to group related components into logical zones. For conceptual groupings within a container (e.g., a "Decision-Making Process" section), use a node of type \`group-label\` to act as a text heading.
          *   **Hierarchy**: Create visual hierarchy by nesting 'tier' containers and using different link thicknesses.
          *   **Spacing**: Ensure generous and consistent spacing between all elements (nodes, containers) to avoid clutter. There must be NO overlaps.
      2.  **Coordinates**: All 'x' and 'y' coordinates are absolute, based on a 1200x800 canvas with (0,0) at the top-left. Node positions are center-based. Container positions are top-left based.
      3.  **Sizing**: Calculate an appropriate 'width' and 'height' for each node based on its label to prevent text overflow. Min width 120, min height 80 (unless it's a special type like 'neuron' or 'group-label').
      4.  **IDs & Connectivity**: Ensure all IDs are unique and valid in 'links' and 'childNodeIds'. Provide concise, one-sentence 'description' for every node and container.
      
      **LINK & ARROW RULES:**
      1.  **Thickness**: Use the optional 'thickness' property on links. Use \`'thick'\` for major connections between high-level containers/groups. Use \`'medium'\` or \`'thin'\` for internal connections. Default is 'medium' if unspecified.
      2.  **Bidirectional**: For feedback loops or mutual interactions, set \`bidirectional: true\` on the link.
      3.  **Labeling**: Add a \`label\` where it adds clarity, such as 'API Call', 'Data Sync', or 'User Request'. Keep labels brief.
      
      **SPECIALIZED ARCHITECTURE RULES:**

      **1. Conceptual & Agent-Based Architectures (like the "Agent Safety" example):**
      - **Hierarchical Containers**: Use large 'tier' containers for top-level concepts (e.g., 'Agent Intrinsic Safety'). Place smaller 'tier' containers inside for sub-sections ('Perception', 'Brain', 'Action').
      - **Group Labels**: Inside containers like 'Brain', use a \`group-label\` node to create text headings for different processes (e.g., "LLM Training", "Decision-Making Process").
      - **Icons**: Use conceptual icons from the list like 'brain', 'perception', 'action', 'planning', 'memory', 'environment'.
      - **Flow**: Use thick arrows to connect the main stages. Use bidirectional arrows for interaction loops.

      **2. Neural Network / Deep Learning Architectures:**
      - **Detection**: If the prompt contains keywords like "neural network", "deep learning model", "fully connected layers", "MLP", "input layer", "hidden layer", or "output layer", you MUST generate the diagram using this specific style.
      - **Node Types**:
        - Use the type \`neuron\` for all circular nodes representing individual neurons.
        - Use the type \`layer-label\` for the text labels "Input", "Hidden", "Output" placed above the layers.
      - **Layout**: Arrange all 'neuron' nodes in distinct, perfectly aligned vertical columns. Place a 'layer-label' node centered above each column.
      - **Styling**: Input/Output layer neurons MUST have 'color' set to '#000000'. Hidden layer neurons MUST have 'color' set to '#CCCCCC'. Links should be 'thin' and 'solid'.
      - **Connectivity**: For fully connected layers, create a 'link' from EVERY neuron in a layer to EVERY neuron in the subsequent layer.

      **3. Standard Cloud/Microservice Architectures:**
      - Use 'containers' to group components into logical tiers (e.g., "Web Tier", "Application Tier", "Data Tier").
      - Use the most specific icon 'type' available. Examples:
        - **AI/ML**: 'llm', 'gemini', 'chat-gpt', 'vector-database', 'embedding-model', 'gpu'.
        - **Cloud**: 'aws-ec2', 'aws-s3', 'azure-vm', 'gcp-compute-engine'.
        - **Generic**: 'cloud', 'api', 'web-server', 'user', 'mobile', 'web-app', 'cache'.

      Produce a diagram that looks like a polished, official reference architecture blueprint.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert cloud and AI solutions architect with a keen eye for visual design. Your task is to generate a JSON representation of a structured, professional-grade software architecture diagram from a natural language prompt. You must strictly follow the provided JSON schema. The final diagram should look like a polished, official reference architecture blueprint, emphasizing clarity, symmetry, and logical flow. Pay meticulous attention to creating a clean, tiered, and grid-aligned layout suitable for formal presentations. When a neural network is requested, you must switch to a specific neuron-and-layer generation style."
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!parsedData.nodes || !parsedData.links) {
        throw new Error("Invalid data structure received from API.");
    }
    
    parsedData.nodes.forEach((node: any) => {
        if (node.locked === undefined) node.locked = false;
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