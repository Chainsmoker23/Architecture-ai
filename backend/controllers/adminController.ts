import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabaseClient';

const CONFIG_TABLE = '_app_config';

interface AppConfig {
    gemini_api_key: string | null;
    dodo_secret_key: string | null;
    dodo_webhook_secret: string | null;
    site_url: string | null;
}

// In-memory cache for the config object to reduce DB lookups.
let cachedConfig: AppConfig | null = null;
let cacheLastUpdated = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all configuration keys from the database.
 * @returns An object with key-value pairs.
 */
const fetchConfigFromDatabase = async (): Promise<Partial<AppConfig>> => {
    const { data, error } = await supabaseAdmin
        .from(CONFIG_TABLE)
        .select('key, value');

    if (error) {
        console.error('Error fetching config from database:', error);
        return {};
    }

    return data.reduce((acc, { key, value }) => {
        acc[key as keyof AppConfig] = value;
        return acc;
    }, {} as Partial<AppConfig>);
};

/**
 * Gets the cached config, refreshing from the database if stale, and merges with env fallbacks.
 * @returns The full application configuration.
 */
export const getCachedConfig = async (): Promise<AppConfig> => {
    const now = Date.now();
    if (!cachedConfig || (now - cacheLastUpdated > CACHE_TTL)) {
        console.log('[Config Cache] Cache stale or empty, fetching from database...');
        const dbConfig = await fetchConfigFromDatabase();
        
        // Merge with environment variable fallbacks
        cachedConfig = {
            gemini_api_key: dbConfig.gemini_api_key || process.env.VITE_API_KEY || null,
            dodo_secret_key: dbConfig.dodo_secret_key || process.env.DODO_SECRET_KEY || null,
            dodo_webhook_secret: dbConfig.dodo_webhook_secret || process.env.DODO_WEBHOOK_SECRET || null,
            site_url: dbConfig.site_url || process.env.SITE_URL || null,
        };
        cacheLastUpdated = now;
    }
    return cachedConfig;
};


/**
 * Clears the in-memory cache for the config.
 */
export const clearConfigCache = () => {
    console.log('[Config Cache] Clearing cache.');
    cachedConfig = null;
    cacheLastUpdated = 0;
};

// --- CONTROLLER FUNCTIONS ---

export const handleAdminLogin = (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
        return res.status(500).json({ error: "Admin authentication is not configured on the server." });
    }

    if (email === adminEmail && password === adminPassword) {
        // Credentials are correct, issue a JWT
        const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '8h' });
        return res.json({ token });
    } else {
        // Invalid credentials
        return res.status(401).json({ error: "Invalid email or password." });
    }
};

export const handleAdminLogout = (req: express.Request, res: express.Response) => {
    // On the server, logout is a stateless action. We can just confirm it.
    // The client will be responsible for clearing the token.
    res.status(200).json({ message: "Logout successful." });
};


/**
 * Controller to get the current configuration for the admin panel.
 */
export const getAdminConfig = async (req: express.Request, res: express.Response) => {
    try {
        const config = await getCachedConfig();
        // Return the actual values to the admin panel for editing
        res.json(config);
    } catch (error) {
        console.error('Error in getAdminConfig controller:', error);
        res.status(500).json({ error: 'Failed to retrieve application configuration.' });
    }
};

/**
 * Controller to update the configuration in the database.
 */
export const updateAdminConfig = async (req: express.Request, res: express.Response) => {
    const { config } = req.body;
    if (!config || typeof config !== 'object') {
        return res.status(400).json({ error: 'A valid configuration object must be provided.' });
    }

    try {
        const recordsToUpsert = Object.entries(config)
            .filter(([_, value]) => typeof value === 'string') // Ensure only string values are saved
            .map(([key, value]) => ({ key, value }));

        if (recordsToUpsert.length === 0) {
            return res.status(400).json({ error: 'No valid configuration values to update.' });
        }

        const { error } = await supabaseAdmin
            .from(CONFIG_TABLE)
            .upsert(recordsToUpsert, { onConflict: 'key' });

        if (error) {
            throw error;
        }

        // Invalidate and update the cache immediately
        clearConfigCache();
        await getCachedConfig();

        res.status(200).json({ message: 'Configuration updated successfully.' });
    } catch (error: any) {
        console.error('Error updating configuration in database:', error);
        // Pass the specific database error back to the client for better debugging.
        const detail = error.details || error.message || 'An unknown database error occurred.';
        res.status(500).json({ error: `Failed to update the configuration. Database error: ${detail}` });
    }
};