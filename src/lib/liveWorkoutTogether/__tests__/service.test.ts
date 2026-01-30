// src/lib/liveWorkoutTogether/__tests__/service.test.ts
// Tests for the live workout service

import {
  createLiveSession,
  joinLiveSession,
  leaveLiveSession,
  startLiveSession,
  endLiveSession,
  completeLiveSet,
  changeExercise,
  sendReaction,
  updateParticipantStatus,
  updateReadyStatus,
  sendLiveMessage,
  getActiveLiveSessions,
  getLiveSession,
  getSessionParticipants,
  getSessionSummary,
  getExerciseName,
  calculateE1RM,
  generateSessionInvitation,
} from "../service";

describe("LiveWorkoutService", () => {
  describe("Utility Functions", () => {
    describe("getExerciseName", () => {
      it("should return exercise name for valid exercise ID", () => {
        const name = getExerciseName("bench");
        // Just check that it returns something (the actual name depends on the exercise database)
        expect(name).toBeTruthy();
        expect(typeof name).toBe("string");
      });

      it("should return the ID itself for unknown exercise IDs", () => {
        const name = getExerciseName("unknown_exercise");
        expect(name).toBe("unknown_exercise");
      });
    });

    describe("calculateE1RM", () => {
      it("should calculate e1RM using Epley formula", () => {
        const e1rm = calculateE1RM(100, 5);
        expect(e1rm).toBe(100 * (1 + 5 / 30));
      });

      it("should handle zero reps", () => {
        const e1rm = calculateE1RM(100, 0);
        expect(e1rm).toBe(100);
      });

      it("should handle high reps", () => {
        const e1rm = calculateE1RM(100, 20);
        expect(e1rm).toBe(100 * (1 + 20 / 30));
      });
    });
  });

  describe("Service Functions", () => {
    // Mock getUser to return a test user
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should export all required functions", () => {
      expect(createLiveSession).toBeDefined();
      expect(joinLiveSession).toBeDefined();
      expect(leaveLiveSession).toBeDefined();
      expect(startLiveSession).toBeDefined();
      expect(endLiveSession).toBeDefined();
      expect(completeLiveSet).toBeDefined();
      expect(changeExercise).toBeDefined();
      expect(sendReaction).toBeDefined();
      expect(updateParticipantStatus).toBeDefined();
      expect(updateReadyStatus).toBeDefined();
      expect(sendLiveMessage).toBeDefined();
      expect(getActiveLiveSessions).toBeDefined();
      expect(getLiveSession).toBeDefined();
      expect(getSessionParticipants).toBeDefined();
      expect(getSessionSummary).toBeDefined();
      expect(generateSessionInvitation).toBeDefined();
    });
  });
});
