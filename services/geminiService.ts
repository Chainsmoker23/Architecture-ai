import { DiagramData, Node, GraphData } from "../types";
import type { Content } from "@google/genai";
import { supabase } from '../supabaseClient';

// Reusable fetch function for our backend API
const fetchFromApi = async (endpoint: string, body: object) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
        throw new Error(errorData.error || `An unknown error occurred on the server.`);
    }

    return response.json();
};

export const generateDiagramData = async (prompt: string, userApiKey?: string): Promise<DiagramData> => {
  try {
    const parsedData = await fetchFromApi('/generate-diagram', { prompt, userApiKey });
    
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
    console.error("Error fetching diagram data from backend:", String(error));
    // Re-throw to be caught by the component
    throw error;
  }
};

export const generateNeuralNetworkData = async (prompt: string, userApiKey?: string): Promise<DiagramData> => {
    try {
        const parsedData = await fetchFromApi('/generate-neural-network', { prompt, userApiKey });

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
        console.error("Error fetching neural network data from backend:", String(error));
        throw error;
    }
};

export const generateGraphData = async (prompt: string, userApiKey?: string): Promise<GraphData> => {
    try {
        const parsedData = await fetchFromApi('/generate-graph', { prompt, userApiKey });
        return parsedData as GraphData;
    } catch (error) {
        console.error("Error fetching graph data from backend:", String(error));
        throw error;
    }
};

export const explainArchitecture = async (diagramData: DiagramData, userApiKey?: string): Promise<string> => {
    try {
        const { explanation } = await fetchFromApi('/explain-architecture', { diagramData, userApiKey });
        return explanation;
    } catch (error) {
        console.error("Error fetching explanation from backend:", String(error));
        throw error;
    }
};

export const chatWithAssistant = async (history: Content[], userApiKey?: string): Promise<string> => {
  try {
    const { response } = await fetchFromApi('/chat', { history, userApiKey });
    return response;
  } catch (error) {
    console.error("Error fetching chat response from backend:", String(error));
    throw error;
  }
};