import { Request } from 'express';
import { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseClient';

export const FREE_GENERATION_LIMIT = 30;

/**
 * Authenticates a user based on the Authorization header.
 * @param req The Express request object.
 * @returns The authenticated Supabase User object or null.
 */
export const authenticateUser = async (req: Request): Promise<User | null> => {
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
 * Checks if a user can generate content based on their plan and usage,
 * and increments their count if they are on a free plan.
 * @param user The authenticated Supabase User object.
 * @returns An object indicating if the generation is allowed.
 */
export const checkAndIncrementGenerationCount = async (user: User): Promise<{ allowed: boolean; error?: string }> => {
    const plan = user.user_metadata?.plan || 'free';
    
    if (plan !== 'free') {
        // Premium users have unlimited generations.
        return { allowed: true };
    }

    const generationCount = user.user_metadata?.generation_count || 0;

    if (generationCount >= FREE_GENERATION_LIMIT) {
        return { allowed: false, error: 'GENERATION_LIMIT_EXCEEDED' };
    }

    // Increment the count for the free user
    const newCount = generationCount + 1;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, generation_count: newCount }
    });

    if (error) {
        console.error(`[Backend] Failed to update generation count for user ${user.id}:`, error);
        // Allow the generation for a better user experience, even if the update fails, but log the error.
        return { allowed: true }; 
    }

    console.log(`[Backend] User ${user.id} generation count updated to ${newCount}.`);
    return { allowed: true };
};
