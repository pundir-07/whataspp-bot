import * as db from "../db/index.js";

export interface Message {
    id: number;
    meta_message_id: string;
    wa_id: string;
    direction: string;
    status: string;
    type: string;
    content: string | Record<string, any> | null;
    sent_at: Date | string | number;
    created_at: Date;
    updated_at: Date;
}

export interface MessageDTO {
    metaMessageId: string;
    direction?: string | null;
    status?: string | null;
    type: string;
    content: string | Record<string, any> | null;
    sentAt: Date | string | number;
}

export async function upsertMessage(waId: string, message: MessageDTO): Promise<Message | null> {
    const { rows } = await db.query(
        `
        INSERT INTO messages (
            meta_message_id,
            wa_id,
            direction,
            status,
            type,
            content,
            sent_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (meta_message_id)
        DO UPDATE SET
            status = EXCLUDED.status
        RETURNING *;
        `,
        [
            message.metaMessageId,
            waId,
            message.direction ?? "incoming",
            message.status ?? "received",
            message.type,
            message.content,
            message.sentAt ? new Date(Number(message.sentAt) * 1000) : new Date(),
        ]
    );

    return rows[0] || null;
}

export async function updateMessageStatus(metaMessageId: string, status: string): Promise<Message | null> {
    const { rows } = await db.query(
        `
        UPDATE messages
        SET status = $2
        WHERE meta_message_id = $1
        RETURNING *;
        `,
        [metaMessageId, status]
    );

    return rows[0] || null;
}

export async function findAllMessagesByWaId(waId: string): Promise<Message[]> {
    const { rows } = await db.query(
        `
        SELECT *
        FROM messages
        WHERE wa_id = $1
        ORDER BY sent_at DESC;
        `,
        [waId]
    );

    return rows;
}
