import * as db from "../db/index.js";

export interface User {
    id: number;
    wa_id: string;
    profile_name: string;
    created_at: Date;
    updated_at: Date;
}

export async function create(wa_id: string, profileName: string): Promise<User | null> {
    const result = await db.query(`
        INSERT INTO users (wa_id, profile_name)
        VALUES ($1, $2) 
        RETURNING *;
    `, [wa_id, profileName]);
    return result.rows[0] || null;
}

export async function findByWaId(waId: string): Promise<User | null> {
    const result = await db.query(`
        SELECT *
        FROM users
        WHERE wa_id = $1;
    `, [waId]);

    return result.rows[0] ?? null;
}

export async function upsert(waId: string, profileName: string): Promise<User> {
    const result = await db.query(`
        INSERT INTO users (
            wa_id,
            profile_name
        )
        VALUES ($1, $2)
        ON CONFLICT (wa_id)
        DO UPDATE SET
            profile_name = EXCLUDED.profile_name,
            updated_at = NOW()
        RETURNING *;
    `, [waId, profileName]);

    return result.rows[0];
}
