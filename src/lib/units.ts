export const KG_PER_LB = 0.45359237;

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function roundToStep(value: number, step: number): number {
  if (step <= 0) throw new Error("step must be > 0");
  const scaled = value / step;
  const rounded = Math.round(scaled);
  return Math.round(rounded * step * 1e6) / 1e6;
}
