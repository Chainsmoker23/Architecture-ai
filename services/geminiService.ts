import { DiagramData, ArchNode } from "../types";
import type { Content } from "@google/genai";
import { supabase } from '../supabaseClient';

// Reusable fetch function for our backend API
const fetchFromApi = async (endpoint: string, body?: object, method: 'POST' | 'GET' | 'DELETE' = 'POST') => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const options: RequestInit = {
        method,
        headers,
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`/api${endpoint}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
        throw new Error(errorData.error || `An unknown error occurred on the server.`);
    }

    // Handle responses that might not have a body (like DELETE)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {}; // Return empty object for non-json responses
};

export const generateDiagramData = async (prompt: string, userApiKey?: string): Promise<DiagramData> => {
  try {
    const parsedData = await fetchFromApi('/generate-diagram', { prompt, userApiKey });
    
    // Sanitize node and container data to prevent rendering issues from invalid values
    (parsedData.nodes || []).forEach((node: ArchNode) => {
        node.x = parseFloat(String(node.x));
        node.y = parseFloat(String(node.y));
        node.width = parseFloat(String(node.width));
        node.height = parseFloat(String(node.height));

        node.x = isFinite(node.x) ? node.x : 600;
        node.y = isFinite(node.y) ? node.y : 400;
        node.width = isFinite(node.width) && node.width > 10 ? node.width : 150;
        node.height = isFinite(node.height) && node.height > 10 ? node.height : 80;
        if (node.locked === undefined) node.locked = false;
        
        // Auto-sizing safety net to prevent text truncation
        if (node.label && node.type !== 'neuron' && node.type !== 'layer-label') {
            const labelLength = node.label.length;
            // Heuristic to ensure nodes are large enough for their labels.
            if (labelLength > 25) { // For very long labels
                if (node.width < 180) node.width = 180;
                if (node.height < 90) node.height = 90;
            } else if (labelLength > 18) { // For moderately long labels
                if (node.width < 160) node.width = 160;
            }
        }
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
        (parsedData.nodes || []).forEach((node: ArchNode) => {
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

// --- API Key Management Services ---

export const getUserApiKey = async (): Promise<string | null> => {
    try {
        const { apiKey } = await fetchFromApi('/user/api-key', undefined, 'GET');
        return apiKey;
    } catch (error) {
        console.error("Error fetching user API key:", String(error));
        throw error;
    }
};

export const generateUserApiKey = async (): Promise<string> => {
    try {
        const { apiKey } = await fetchFromApi('/user/api-key', {}, 'POST');
        if (!apiKey) throw new Error("API key was not returned from the server.");
        return apiKey;
    } catch (error) {
        console.error("Error generating user API key:", String(error));
        throw error;
    }
};

export const revokeUserApiKey = async (): Promise<void> => {
    try {
        await fetchFromApi('/user/api-key', undefined, 'DELETE');
    } catch (error) {
        console.error("Error revoking user API key:", String(error));
        throw error;
    }
};