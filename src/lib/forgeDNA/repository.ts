import { supabase } from "../supabase/client";
import type { ForgeDNA } from "./types";

/**
 * Repository for Forge DNA history operations
 */

export interface ForgeDNAHistoryEntry {
  id: string;
  userId: string;
  generatedAt: number; // milliseconds since epoch
  dnaData: ForgeDNA;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Save a Forge DNA snapshot to history
 */
export async function saveDNASnapshot(userId: string, dna: ForgeDNA): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('forge_dna_history')
      .insert({
        user_id: userId,
        generated_at: new Date(dna.generatedAt).toISOString(),
        dna_data: dna
      });

    if (error) {
      console.error('Error saving DNA snapshot:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error saving DNA snapshot:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get historical DNA snapshots for a user
 */
export async function getDNAHistory(userId: string, limit: number = 10): Promise<{ data: ForgeDNAHistoryEntry[] | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('forge_dna_history')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching DNA history:', error);
      return { data: null, error: error.message };
    }

    // Transform database rows to ForgeDNAHistoryEntry format
    const historyEntries: ForgeDNAHistoryEntry[] = data.map(row => ({
      id: row.id,
      userId: row.user_id,
      generatedAt: new Date(row.generated_at).getTime(),
      dnaData: row.dna_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: historyEntries };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching DNA history:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get DNA snapshots within a date range
 */
export async function getDNAHistoryByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ data: ForgeDNAHistoryEntry[] | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('forge_dna_history')
      .select('*')
      .eq('user_id', userId)
      .gte('generated_at', startDate.toISOString())
      .lte('generated_at', endDate.toISOString())
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching DNA history by date range:', error);
      return { data: null, error: error.message };
    }

    // Transform database rows to ForgeDNAHistoryEntry format
    const historyEntries: ForgeDNAHistoryEntry[] = data.map(row => ({
      id: row.id,
      userId: row.user_id,
      generatedAt: new Date(row.generated_at).getTime(),
      dnaData: row.dna_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data: historyEntries };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching DNA history by date range:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Delete old DNA snapshots (keep only recent ones)
 */
export async function cleanupOldDNASnapshots(userId: string, keepCount: number = 10): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the IDs of snapshots to delete (all except the most recent keepCount)
    const { data: snapshotsToDelete, error: fetchError } = await supabase
      .from('forge_dna_history')
      .select('id')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .range(keepCount, 1000); // Get everything after keepCount

    if (fetchError) {
      console.error('Error fetching old DNA snapshots for cleanup:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (snapshotsToDelete && snapshotsToDelete.length > 0) {
      const idsToDelete = snapshotsToDelete.map(snapshot => snapshot.id);

      const { error: deleteError } = await supabase
        .from('forge_dna_history')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting old DNA snapshots:', deleteError);
        return { success: false, error: deleteError.message };
      }
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error cleaning up old DNA snapshots:', errorMessage);
    return { success: false, error: errorMessage };
  }
}