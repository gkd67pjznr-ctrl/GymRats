// src/lib/sync/repositories/reportRepository.ts
// Repository for content moderation reports CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { Report, ReportReason, ID } from '../../socialModel';
import type { DatabaseReport, DatabaseReportInsert } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for content reports
 */
export interface ReportRepository {
  // Submit a report
  submitReport(report: Omit<Report, 'id' | 'createdAtMs' | 'status'>): Promise<Report>;

  // Fetch reports submitted by the current user
  fetchMyReports(userId: ID): Promise<Report[]>;

  // Check if user already reported a post/user
  hasReported(reporterId: ID, targetPostId?: ID, targetUserId?: ID): Promise<boolean>;
}

/**
 * Convert database row to Report
 */
function fromDatabase(db: DatabaseReport): Report {
  return {
    id: db.id,
    reporterUserId: db.reporter_user_id,
    targetPostId: db.target_post_id ?? undefined,
    targetUserId: db.target_user_id ?? undefined,
    reason: db.reason as ReportReason,
    additionalInfo: db.additional_info ?? undefined,
    createdAtMs: new Date(db.created_at).getTime(),
    status: db.status as Report['status'],
  };
}

/**
 * Report repository implementation
 */
export const reportRepository: ReportRepository = {
  /**
   * Submit a new report
   */
  async submitReport(report: Omit<Report, 'id' | 'createdAtMs' | 'status'>): Promise<Report> {
    // If Supabase is not configured, simulate success with a mock ID
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[reportRepository] Supabase placeholder detected, simulating report submission');
      }
      const mockId = `mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
      return {
        ...report,
        id: mockId,
        createdAtMs: Date.now(),
        status: 'pending',
      };
    }

    const insertData: DatabaseReportInsert = {
      reporter_user_id: report.reporterUserId,
      target_post_id: report.targetPostId ?? null,
      target_user_id: report.targetUserId ?? null,
      reason: report.reason,
      additional_info: report.additionalInfo ?? null,
    };

    const { data, error } = await supabase
      .from('reports')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('[reportRepository] submitReport error:', error);
      throw new Error(`Failed to submit report: ${error.message}`);
    }

    return fromDatabase(data);
  },

  /**
   * Fetch reports submitted by a user
   */
  async fetchMyReports(userId: ID): Promise<Report[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[reportRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // Don't throw for table-not-found errors
      const isTableMissing = error.message.includes('Could not find the') ||
                             error.message.includes('relation') ||
                             error.message.includes('does not exist');
      if (isTableMissing) {
        console.warn('[reportRepository] Reports table not set up yet');
        return [];
      }
      console.error('[reportRepository] fetchMyReports error:', error);
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Check if user has already reported a specific post or user
   */
  async hasReported(reporterId: ID, targetPostId?: ID, targetUserId?: ID): Promise<boolean> {
    // If Supabase is not configured, return false
    if (isSupabasePlaceholder) {
      return false;
    }

    let query = supabase
      .from('reports')
      .select('id')
      .eq('reporter_user_id', reporterId);

    if (targetPostId) {
      query = query.eq('target_post_id', targetPostId);
    }
    if (targetUserId) {
      query = query.eq('target_user_id', targetUserId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      // Don't throw for table-not-found errors
      const isTableMissing = error.message.includes('Could not find the') ||
                             error.message.includes('relation') ||
                             error.message.includes('does not exist');
      if (isTableMissing) {
        return false;
      }
      console.error('[reportRepository] hasReported error:', error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  },
};
