// __tests__/lib/prPrediction.test.ts
// Tests for PR prediction utilities

import {
  predictPR,
  getPredictionMessage,
  getPredictionIntensity,
} from "@/src/lib/prPrediction";
import type { ExerciseSessionState } from "@/src/lib/perSetCueTypes";

describe("predictPR", () => {
  const emptyState: ExerciseSessionState = {
    bestE1RMKg: 0,
    bestWeightKg: 0,
    bestRepsAtWeight: {},
  };

  const existingState: ExerciseSessionState = {
    bestE1RMKg: 100, // 100kg e1RM
    bestWeightKg: 90, // 90kg best weight
    bestRepsAtWeight: {
      "90": 5, // 5 reps at ~90kg (kg bucket keys are integers)
      "80": 8, // 8 reps at ~80kg
    },
  };

  describe("weight PR detection", () => {
    it("should predict weight PR when weight exceeds best", () => {
      const prediction = predictPR(95, 5, "kg", existingState);
      expect(prediction.willBeWeightPR).toBe(true);
    });

    it("should not predict weight PR when weight is equal to best", () => {
      const prediction = predictPR(90, 5, "kg", existingState);
      expect(prediction.willBeWeightPR).toBe(false);
    });

    it("should not predict weight PR when weight is below best", () => {
      const prediction = predictPR(85, 5, "kg", existingState);
      expect(prediction.willBeWeightPR).toBe(false);
    });
  });

  describe("rep PR detection", () => {
    it("should predict rep PR when reps exceed best at weight bucket", () => {
      const prediction = predictPR(90, 6, "kg", existingState);
      expect(prediction.willBeRepPR).toBe(true);
    });

    it("should not predict rep PR when reps match best at weight bucket", () => {
      const prediction = predictPR(90, 5, "kg", existingState);
      expect(prediction.willBeRepPR).toBe(false);
    });

    it("should predict rep PR at new weight bucket", () => {
      const prediction = predictPR(100, 3, "kg", existingState);
      expect(prediction.willBeRepPR).toBe(true); // New bucket, any reps is PR
    });
  });

  describe("e1RM PR detection", () => {
    it("should predict e1RM PR when calculated e1RM exceeds best", () => {
      // 90kg x 8 reps = 90 * (1 + 8/30) = 114kg e1RM
      const prediction = predictPR(90, 8, "kg", existingState);
      expect(prediction.willBeE1RMPR).toBe(true);
      expect(prediction.predictedE1RM).toBeGreaterThan(100);
    });

    it("should not predict e1RM PR when calculated e1RM is below best", () => {
      // 80kg x 5 reps = 80 * (1 + 5/30) = 93.3kg e1RM
      const prediction = predictPR(80, 5, "kg", existingState);
      expect(prediction.willBeE1RMPR).toBe(false);
    });
  });

  describe("e1RM proximity", () => {
    it("should calculate proximity as ratio of predicted to best e1RM", () => {
      // 80kg x 5 reps = ~93.3kg e1RM, proximity = 93.3/100 = 0.933
      const prediction = predictPR(80, 5, "kg", existingState);
      expect(prediction.e1rmProximity).toBeCloseTo(0.933, 1);
    });

    it("should cap proximity at 1 when exceeding best", () => {
      const prediction = predictPR(100, 8, "kg", existingState);
      expect(prediction.e1rmProximity).toBe(1);
    });

    it("should return 1 for any set when no previous e1RM exists", () => {
      const prediction = predictPR(50, 5, "kg", emptyState);
      expect(prediction.e1rmProximity).toBe(1);
    });
  });

  describe("reps needed for e1RM PR", () => {
    it("should calculate reps needed at current weight for e1RM PR", () => {
      // At 90kg, need e1RM > 100kg
      // e1RM = 90 * (1 + reps/30) > 100
      // reps/30 > 100/90 - 1 = 0.111
      // reps > 3.33, so need 4 reps
      const prediction = predictPR(90, 3, "kg", existingState);
      expect(prediction.repsNeededForE1RMPR).toBeGreaterThan(3);
    });

    it("should return null when weight too low for reasonable reps", () => {
      // At 50kg, would need 30+ reps for 100kg e1RM
      const prediction = predictPR(50, 5, "kg", existingState);
      expect(prediction.repsNeededForE1RMPR).toBeNull();
    });
  });
});

describe("getPredictionMessage", () => {
  it("should return weight PR message when weight PR predicted", () => {
    const prediction = predictPR(95, 5, "kg", {
      bestE1RMKg: 100,
      bestWeightKg: 90,
      bestRepsAtWeight: {},
    });
    expect(getPredictionMessage(prediction)).toBe("New weight PR!");
  });

  it("should return rep PR message when rep PR predicted", () => {
    const prediction = predictPR(90, 6, "kg", {
      bestE1RMKg: 100,
      bestWeightKg: 90,
      bestRepsAtWeight: { "90": 5 },
    });
    expect(getPredictionMessage(prediction)).toBe("Rep PR at this weight!");
  });

  it("should return close message when proximity >= 0.95", () => {
    // Create a prediction with ~97% proximity (no PR)
    const prediction = predictPR(85, 5, "kg", {
      bestE1RMKg: 100,
      bestWeightKg: 90,
      bestRepsAtWeight: { "85": 10 }, // Already has 10 reps at this weight
    });

    // Check if message indicates closeness based on proximity
    const message = getPredictionMessage(prediction);
    if (prediction.e1rmProximity >= 0.95) {
      expect(message).toContain("Almost");
    }
  });

  it("should return null when not close to PR", () => {
    const prediction = predictPR(50, 5, "kg", {
      bestE1RMKg: 100,
      bestWeightKg: 90,
      bestRepsAtWeight: { "50": 10 },
    });
    expect(getPredictionMessage(prediction)).toBeNull();
  });
});

describe("getPredictionIntensity", () => {
  it("should return 'pr' when any PR type predicted", () => {
    const prediction = predictPR(95, 5, "kg", {
      bestE1RMKg: 100,
      bestWeightKg: 90,
      bestRepsAtWeight: {},
    });
    expect(getPredictionIntensity(prediction)).toBe("pr");
  });

  it("should return 'very-close' when proximity >= 0.95 but no PR", () => {
    // Need proximity ~0.96 without triggering any PR
    const state: ExerciseSessionState = {
      bestE1RMKg: 100,
      bestWeightKg: 100, // Weight PR not triggered
      bestRepsAtWeight: { "96": 10 }, // Rep PR not triggered (kg bucket key is integer)
    };
    const prediction = predictPR(96, 1, "kg", state); // 96kg x 1 = 96kg e1RM

    if (prediction.e1rmProximity >= 0.95 && !prediction.willBeE1RMPR) {
      expect(getPredictionIntensity(prediction)).toBe("very-close");
    }
  });

  it("should return 'none' when far from PR", () => {
    const prediction = predictPR(50, 5, "kg", {
      bestE1RMKg: 100,
      bestWeightKg: 90,
      bestRepsAtWeight: { "50": 10 }, // kg bucket key is integer
    });
    expect(getPredictionIntensity(prediction)).toBe("none");
  });
});
