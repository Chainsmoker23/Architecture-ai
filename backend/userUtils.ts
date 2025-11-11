import * as express from 'express';
import { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseClient';

export const FREE_GENERATION_LIMIT = 30;
export const HOBBYIST_GENERATION_LIMIT = 50;

/**
 * Authenticates a user based on the Authorization header.
 * @param req The Express request object.
 * @returns The authenticated Supabase User object or null.
 */
// FIX: Use consistent express namespace for Request type.
export const authenticateUser = async (req: express.Request): Promise<User | null> => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return null;
        }
        return user;
    } catch (e) {
        console.error("Error during user authentication:", e);
        return null;
    }
};

/**
 * Checks if a user can generate content based on their plan and usage, without modifying their count.
 * @param user The authenticated Supabase User object.
 * @returns An object indicating if the generation is allowed and the user's current count.
 */
export const canUserGenerate = async (user: User): Promise<{ allowed: boolean; error?: string, generationCount: number }> => {
    // Re-fetch user to get the absolute latest metadata before checking to prevent stale data issues.
    const { data: { user: freshUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (fetchError || !freshUser) {
        console.error(`[Backend] Failed to re-fetch user ${user.id} before checking limits:`, fetchError);
        throw new Error('Could not verify user generation status.');
    }

    const plan = freshUser.user_metadata?.plan || 'free';
    const generationCount = freshUser.user_metadata?.generation_count || 0;
    
    if (plan === 'pro' || plan === 'business') {
        return { allowed: true, generationCount };
    }

    const limit = plan === 'hobbyist' ? HOBBYIST_GENERATION_LIMIT : FREE_GENERATION_LIMIT;

    if (generationCount >= limit) {
        return { allowed: false, error: 'GENERATION_LIMIT_EXCEEDED', generationCount };
    }
    
    return { allowed: true, generationCount };
};

/**
 * Increments the generation count for a non-premium user.
 * @param user The authenticated Supabase User object.
 * @returns The new generation count, or null if the user is premium.
 */
export const incrementGenerationCount = async (user: User): Promise<number | null> => {
    const plan = user.user_metadata?.plan || 'free';
    if (plan === 'pro' || plan === 'business') {
        return null; // Premium users don't have their count incremented.
    }
    
    // Re-fetch the user directly from the database to ensure we have the latest metadata.
    const { data: { user: freshUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (fetchError || !freshUser) {
        console.error(`[Backend] Failed to re-fetch user ${user.id} before incrementing count:`, fetchError);
        throw new Error('Could not verify user generation status before incrementing.');
    }
    
    const generationCount = freshUser.user_metadata?.generation_count || 0;
    const newCount = generationCount + 1;
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(freshUser.id, {
        user_metadata: { ...freshUser.user_metadata, generation_count: newCount }
    });

    if (error) {
        console.error(`[Backend] Failed to update generation count for user ${freshUser.id}:`, error);
        throw new Error('Failed to update user generation count.');
    }

    console.log(`[Backend] User ${freshUser.id} generation count updated to ${newCount}.`);
    return newCount;
};