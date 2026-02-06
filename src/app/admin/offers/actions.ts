'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type OfferStatus = 'draft' | 'sent' | 'viewed' | 'signed';

export async function updateOfferStatus(
    offerId: string, 
    status: OfferStatus
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        
        const updateData: Record<string, string | null> = { status };
        
        // Set timestamp based on status
        if (status === 'sent') {
            updateData.sent_at = new Date().toISOString();
        } else if (status === 'viewed') {
            updateData.viewed_at = new Date().toISOString();
        } else if (status === 'signed') {
            updateData.signed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', offerId)
            .eq('document_type', 'proposal');

        if (error) {
            console.error('Error updating offer status:', error);
            return { error: 'Failed to update offer status' };
        }

        revalidatePath('/admin/offers');
        return { success: true };
    } catch (error) {
        console.error('Error in updateOfferStatus:', error);
        return { error: 'An unexpected error occurred' };
    }
}

export async function deleteOffer(
    offerId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // First get the document to find the file path
        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select('file_path')
            .eq('id', offerId)
            .eq('document_type', 'proposal')
            .single();

        if (fetchError) {
            console.error('Error fetching offer:', fetchError);
            return { error: 'Offer not found' };
        }

        // Delete the file from storage
        if (doc?.file_path) {
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([doc.file_path]);

            if (storageError) {
                console.error('Error deleting file from storage:', storageError);
                // Continue anyway - the DB record should still be deleted
            }
        }

        // Delete the document record
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', offerId);

        if (deleteError) {
            console.error('Error deleting offer:', deleteError);
            return { error: 'Failed to delete offer' };
        }

        revalidatePath('/admin/offers');
        return { success: true };
    } catch (error) {
        console.error('Error in deleteOffer:', error);
        return { error: 'An unexpected error occurred' };
    }
}

export async function getClients(): Promise<{ 
    data?: Array<{ id: string; name: string; company_name?: string | null; contact_email?: string | null }>;
    error?: string 
}> {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('clients')
            .select('id, name, company_name, contact_email')
            .order('name');

        if (error) {
            console.error('Error fetching clients:', error);
            return { error: 'Failed to fetch clients' };
        }

        return { data };
    } catch (error) {
        console.error('Error in getClients:', error);
        return { error: 'An unexpected error occurred' };
    }
}
