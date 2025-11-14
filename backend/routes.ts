import * as express from 'express';
// FIX: Renamed imported controller functions to avoid potential conflicts and ensure correct module resolution.
import { 
    handleGenerateDiagram,
    handleGenerateNeuralNetwork, 
    handleExplainArchitecture
} from './controllers/generationController';
import { handleChatWithAssistant } from './controllers/chatController';
import { 
    createCheckoutSession, 
    handleDodoWebhook
} from './controllers/paymentController';
import { 
    getAdminConfig, 
    updateAdminConfig, 
    handleAdminLogin,
    handleAdminLogout,
    getAdminUsers
} from './controllers/adminController';
import { 
    handleGetApiKey,
    handleGenerateApiKey,
    handleRevokeApiKey,
    handleGetActivePlans,
    handleSwitchPlan,
    handleCreateBillingPortalSession,
    handleCancelSubscription
} from './controllers/userController';
import { isAdmin } from './middleware/authMiddleware';
import { handlePublicGenerateDiagram } from './controllers/publicApiController';
import { apiKeyAuth } from './middleware/apiKeyAuthMiddleware';


const router = express.Router();
const v1Router = express.Router(); // Create a new router for version 1 of the public API

// --- PUBLIC API V1 ROUTES ---
// These routes are for external applications using a personal API key.
v1Router.post('/diagrams/generate', handlePublicGenerateDiagram);


// --- PAYMENT & WEBHOOK ROUTES ---

// Endpoint to handle incoming webhooks from Dodo Payments
// Note: express.raw is used here because the webhook signature verification needs the raw, unparsed body.
router.post('/dodo-webhook', express.raw({ type: 'application/json' }), handleDodoWebhook);

// Endpoint for the frontend to create a new checkout session
router.post('/checkout', express.json(), createCheckoutSession);


// --- GEMINI API PROXY ROUTES (for internal app use) ---

router.post('/generate-diagram', express.json(), handleGenerateDiagram);
router.post('/generate-neural-network', express.json(), handleGenerateNeuralNetwork);
router.post('/explain-architecture', express.json(), handleExplainArchitecture);
router.post('/chat', express.json(), handleChatWithAssistant);

// --- USER MANAGEMENT ROUTES ---
router.get('/user/api-key', handleGetApiKey);
router.post('/user/api-key', express.json(), handleGenerateApiKey);
router.delete('/user/api-key', handleRevokeApiKey);
router.get('/user/active-plans', handleGetActivePlans);
router.post('/user/switch-plan', express.json(), handleSwitchPlan);
router.post('/user/billing-portal-session', express.json(), handleCreateBillingPortalSession);
router.post('/user/cancel-subscription', express.json(), handleCancelSubscription);


// --- ADMIN ROUTES ---
router.post('/admin/login', express.json(), handleAdminLogin);
router.post('/admin/logout', express.json(), handleAdminLogout);
router.get('/admin/config', isAdmin, getAdminConfig);
router.post('/admin/config', express.json(), isAdmin, updateAdminConfig);
router.get('/admin/users', isAdmin, getAdminUsers);

// Mount the v1 router with its specific middleware
// It needs express.json() for body parsing and apiKeyAuth for authentication.
router.use('/v1', express.json(), apiKeyAuth, v1Router);


export default router;