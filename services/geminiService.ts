import { GoogleGenAI, Type, Content } from "@google/genai";
import { DiagramData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
          type: { type: Type.STRING, description: "The type of component for icon mapping. Use one of the predefined types like 'aws-ec2', 'user', 'database', 'kubernetes', 'kafka', etc." },
          description: { type: Type.STRING, description: "A brief, one-sentence description of the node's purpose." },
          x: { type: Type.NUMBER, description: "The initial horizontal position of the node's center on a 1200x800 canvas." },
          y: { type: Type.NUMBER, description: "The initial vertical position of the node's center." },
          width: { type: Type.NUMBER, description: "The initial width of the node, based on its label length. Minimum 120." },
          height: { type: Type.NUMBER, description: "The initial height of the node, adjusted for wrapped text if necessary. Minimum 80." },
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
          style: { type: Type.STRING, description: "The line style. Can be 'solid' or 'dotted'." },
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


export const generateDiagramData = async (prompt: string): Promise<DiagramData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Generate a professional, layered software architecture diagram based on the following prompt: "${prompt}".
      The output must be a valid JSON object adhering to the specified schema.
      Key requirements for the diagram structure:
      1.  **Tiered Layout & Containers**: Organize components into logical tiers (e.g., "Web Tier", "Application Tier", "Data Tier") using the 'containers' array. Use containers also for cloud constructs like Regions and Availability Zones.
      2.  **Grid Alignment & Sizing**: Position nodes and containers in a clean, grid-like, and evenly spaced layout with no overlaps. Calculate an appropriate initial 'width' and 'height' for each node based on its label length to prevent text overflow. Node positions are center-based. Container positions are top-left based.
      3.  **Coordinates**: All 'x' and 'y' coordinates are absolute, based on a 1200x800 canvas with (0,0) at the top-left. Container dimensions must be large enough for their child nodes with adequate padding.
      4.  **Connectivity & Descriptions**: Ensure all IDs are unique and valid in 'links' and 'childNodeIds'. Add descriptive labels to links where appropriate. Provide a concise, one-sentence 'description' for every node and container.
      5.  **Advanced Architectures**:
          - **Multi-Tier (4-6 Layers)**: If the prompt implies more than three tiers, create containers for layers like "Presentation Layer", "Edge/CDN Layer", "Application Layer", "Integration/Messaging Layer", "Data Layer", and "Analytics/Monitoring Layer".
          - **Microservices**: If the prompt describes a microservices architecture, group individual services and their dedicated resources (e.g., a database) into separate 'tier' type containers. Label these containers appropriately, like "Service Domain: Payments" or "Inventory Microservice".
      6.  **Icon Specificity**: Use the most specific icon 'type' available from the schema's list. For example, for containerized services use 'kubernetes' or 'docker'. For messaging, use 'kafka', 'aws-sns', 'aws-sqs', or 'message-queue' as appropriate.
      Produce a diagram that looks like a polished, official reference architecture blueprint.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert cloud solutions architect AI with deep expertise in modern cloud-native patterns like microservices, containerization, and event-driven architectures. Your task is to generate a JSON representation of a structured, professional-grade software architecture diagram from a natural language prompt. You must strictly follow the provided JSON schema, ensuring a clean, tiered, and grid-aligned layout suitable for formal presentations. Pay close attention to logical component grouping, positioning, sizing, and providing descriptions."
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
    throw new Error("Failed to generate diagram. The model may have returned an invalid format.");
  }
};


export const explainArchitecture = async (diagramData: DiagramData): Promise<string> => {
    try {
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
        throw new Error("Failed to generate explanation.");
    }
}

export const chatWithAssistant = async (history: Content[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        systemInstruction: `You are 'Archie', a friendly AI assistant for ArchiGen AI, a tool that generates software architecture diagrams from text. Your primary roles are:
1.  **Generate Example Prompts:** When a user asks for a prompt idea (e.g., "prompt for a video streaming site"), create a single, clear, and detailed prompt suitable for the ArchiGen diagram generator. For instance: 'Design a scalable video streaming service on AWS using S3 for video storage, CloudFront for CDN, EC2 for processing, and RDS for metadata.' **Crucially, you must wrap the final generated prompt in a markdown code block like this: \`\`\`prompt\n[The prompt goes here]\n\`\`\`**. Do not include any other text outside the code block when generating a prompt.
2.  **Answer Questions:** Briefly answer questions about ArchiGen AI. Explain that it's a web app that uses Google's Gemini AI to turn text descriptions into architecture diagrams. Mention it's for developers, architects, and students.
3.  **Be Concise:** Keep all your answers short and to the point.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error with assistant chat:", error);
    throw new Error("Sorry, I'm having trouble connecting right now.");
  }
};
