import * as express from 'express';
// FIX: Renamed imported controller functions to avoid potential conflicts and ensure correct module resolution.
import { 
    handleGenerateDiagram,
    handleGenerateNeuralNetwork, 
    handleExplainArchitecture, 
    handleGetApiKey,
    handleGenerateApiKey,
    handleRevokeApiKey
} from './controllers/generationController';
import { handleChatWithAssistant } from './controllers/chatController';
import { 
    createCheckoutSession, 
    handleDodoWebhook, 
    confirmMockPayment 
} from './controllers/paymentController';
import { 
    getAdminConfig, 
    updateAdminConfig, 
    handleAdminLogin,
    handleAdminLogout 
} from './controllers/adminController';
import { isAdmin } from './middleware/authMiddleware';


const router = express.Router();

// --- PAYMENT & WEBHOOK ROUTES ---

// Endpoint to handle the form submission from the mock payment page
router.post('/confirm-payment', confirmMockPayment);

// Endpoint to handle incoming webhooks from Dodo Payments
// Note: express.raw is used here because the webhook signature verification needs the raw, unparsed body.
router.post('/dodo-webhook', express.raw({ type: 'application/json' }), handleDodoWebhook);

// Endpoint for the frontend to create a new checkout session
router.post('/create-checkout-session', createCheckoutSession);


// --- GEMINI API PROXY ROUTES (for internal app use) ---

router.post('/generate-diagram', handleGenerateDiagram);
router.post('/generate-neural-network', handleGenerateNeuralNetwork);
router.post('/explain-architecture', handleExplainArchitecture);
router.post('/chat', handleChatWithAssistant);

// --- USER API KEY MANAGEMENT ---
router.get('/user/api-key', handleGetApiKey);
router.post('/user/api-key', handleGenerateApiKey);
router.delete('/user/api-key', handleRevokeApiKey);

// --- ADMIN ROUTES ---
router.post('/admin/login', handleAdminLogin);
router.post('/admin/logout', handleAdminLogout);
router.get('/admin/config', isAdmin, getAdminConfig);
router.post('/admin/config', isAdmin, updateAdminConfig);


export default router;