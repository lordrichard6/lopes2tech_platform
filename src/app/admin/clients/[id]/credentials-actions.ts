'use server'

import { requireAdmin } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { addCredentialSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function addCredential(data: {
    client_id: string;
    service_name: string;
    url?: string;
    username?: string;
    password?: string;
    notes?: string;
}) {
    const { supabase } = await requireAdmin();

    // Validate input
    const validated = addCredentialSchema.safeParse(data);
    if (!validated.success) {
        throw new Error(validated.error.issues[0].message);
    }

    let encrypted_password = '';
    let iv = '';
    let salt = '';

    if (data.password) {
        const result = encrypt(data.password);
        encrypted_password = result.content;
        iv = result.iv;
        salt = result.salt;
    }

    const { error } = await supabase
        .from('credentials')
        .insert({
            client_id: data.client_id,
            service_name: data.service_name,
            url: data.url,
            username: data.username,
            encrypted_password,
            iv,
            salt,
            notes: data.notes
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/admin/clients/${data.client_id}`);
}

export async function revealCredential(id: string) {
    const { supabase } = await requireAdmin();

    const { data: credential, error } = await supabase
        .from('credentials')
        .select('encrypted_password, iv, salt')
        .eq('id', id)
        .single();

    if (error || !credential) throw new Error('Credential not found');

    try {
        const password = decrypt(credential.encrypted_password, credential.iv, credential.salt);
        return password;
    } catch (e) {
        console.error('Decryption failed', e);
        throw new Error('Decryption error');
    }
}

export async function deleteCredential(id: string) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

