import express from 'express';
import { 
    generateDiagram, 
    generateNeuralNetwork, 
    generateGraph, 
    explainArchitecture, 
    chatWithAssistant,
    generatePieChart
} from './controllers/generationController';
import { 
    createCheckoutSession, 
    handleDodoWebhook, 
    serveMockPaymentPage, 
    confirmMockPayment 
} from './controllers/paymentController';


const router = express.Router();

// --- PAYMENT & WEBHOOK ROUTES ---

// Endpoint to serve the realistic mock payment page
router.get('/mock-payment', serveMockPaymentPage);

// Endpoint to handle the form submission from the mock payment page
router.post('/confirm-payment', express.urlencoded({ extended: false }), confirmMockPayment);

// Endpoint to handle incoming webhooks from Dodo Payments
router.post('/dodo-webhook', express.raw({ type: 'application/json' }), handleDodoWebhook);

// Endpoint for the frontend to create a new checkout session
router.post('/create-checkout-session', express.json(), createCheckoutSession);


// --- GEMINI API PROXY ROUTES ---

router.post('/api/generate-diagram', express.json(), generateDiagram);
router.post('/api/generate-neural-network', express.json(), generateNeuralNetwork);
router.post('/api/generate-graph', express.json(), generateGraph);
router.post('/api/generate-pie-chart', express.json(), generatePieChart);
router.post('/api/explain-architecture', express.json(), explainArchitecture);
router.post('/api/chat', express.json(), chatWithAssistant);


export default router;