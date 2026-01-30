import { supabase } from "../supabase/client";
import type { ForgeDNAHistoryEntry } from "./types";
import type { SyncOperation } from "../sync/syncTypes";

type ConflictResolutionStrategy = 'server_wins' | 'client_wins' | 'merge';

/**
 * Sync repository for Forge DNA history data
 * Integrates with the existing sync infrastructure
 */

export class ForgeDNASyncRepository {
  private tableName = 'forge_dna_history';

  /**
   * Fetch local pending operations for DNA history
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    // In a real implementation, this would fetch from a local queue
    // For now, we'll return an empty array as a placeholder
    return [];
  }

  /**
   * Save a DNA history entry to the server
   */
  async saveToServer(entry: Omit<ForgeDNAHistoryEntry, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string; data?: ForgeDNAHistoryEntry }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: entry.userId,
          generated_at: new Date(entry.generatedAt).toISOString(),
          dna_data: entry.dnaData
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving DNA history to server:', error);
        return { success: false, error: error.message };
      }

      // Transform the database row to ForgeDNAHistoryEntry format
      const historyEntry: ForgeDNAHistoryEntry = {
        id: data.id,
        userId: data.user_id,
        generatedAt: new Date(data.generated_at).getTime(),
        dnaData: data.dna_data,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { success: true, data: historyEntry };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving DNA history to server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Fetch DNA history entries from the server
   */
  async fetchFromServer(userId: string, since?: Date): Promise<{ success: boolean; data?: ForgeDNAHistoryEntry[]; error?: string }> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false });

      if (since) {
        query = query.gte('generated_at', since.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching DNA history from server:', error);
        return { success: false, error: error.message };
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

      return { success: true, data: historyEntries };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching DNA history from server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update a DNA history entry on the server
   */
  async updateOnServer(entry: ForgeDNAHistoryEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          generated_at: new Date(entry.generatedAt).toISOString(),
          dna_data: entry.dnaData,
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.id)
        .eq('user_id', entry.userId);

      if (error) {
        console.error('Error updating DNA history on server:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating DNA history on server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Delete a DNA history entry from the server
   */
  async deleteFromServer(entryId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting DNA history from server:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error deleting DNA history from server:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Resolve conflicts between local and server data
   */
  resolveConflicts(
    localEntries: ForgeDNAHistoryEntry[],
    serverEntries: ForgeDNAHistoryEntry[],
    strategy: ConflictResolutionStrategy = 'server_wins'
  ): ForgeDNAHistoryEntry[] {
    switch (strategy) {
      case 'server_wins':
        return serverEntries;
      case 'client_wins':
        return localEntries;
      case 'merge':
        // For DNA history, we'll merge by taking the most recent entries
        const allEntries = [...localEntries, ...serverEntries];
        const uniqueEntries = new Map<string, ForgeDNAHistoryEntry>();

        allEntries.forEach(entry => {
          const key = `${entry.userId}-${entry.generatedAt}`;
          const existing = uniqueEntries.get(key);

          // Keep the most recently updated entry
          if (!existing || new Date(entry.updatedAt) > new Date(existing.updatedAt)) {
            uniqueEntries.set(key, entry);
          }
        });

        return Array.from(uniqueEntries.values())
          .sort((a, b) => b.generatedAt - a.generatedAt); // Sort by generated time, newest first
      default:
        return serverEntries;
    }
  }

  /**
   * Subscribe to real-time updates for DNA history
   */
  subscribeToRealtime(userId: string, callback: (payload: any) => void): () => void {
    const subscription = supabase
      .channel('forge_dna_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get sync status for DNA history
   */
  async getSyncStatus(userId: string): Promise<{
    totalEntries: number;
    lastSynced: Date | null;
    pendingOperations: number;
    isSyncing: boolean;
  }> {
    try {
      // Get total entries count
      const { count, error: countError } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        console.error('Error getting DNA history count:', countError);
      }

      // In a real implementation, we would track last sync time and pending operations
      // For now, we'll return placeholder values
      return {
        totalEntries: count || 0,
        lastSynced: new Date(), // Placeholder
        pendingOperations: 0, // Placeholder
        isSyncing: false // Placeholder
      };
    } catch (err) {
      console.error('Error getting sync status:', err);
      return {
        totalEntries: 0,
        lastSynced: null,
        pendingOperations: 0,
        isSyncing: false
      };
    }
  }
}