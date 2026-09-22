export const G = 9.81;

export const FITTINGS = {
  enlargement: { label: 'Sudden Enlargement', diameter_m: 0.024, referenceK: null },
  contraction: { label: 'Sudden Contraction', diameter_m: 0.018, referenceK: 0.30 },
  bend: { label: 'Short Bend', diameter_m: 0.018, referenceK: 0.60 },
  elbow: { label: 'Elbow', diameter_m: 0.018, referenceK: 1.48 },
};

export function pipeArea(diameter_m) {
  return (Math.PI / 4) * diameter_m ** 2;
}

export function lossCoefficient(headLoss_m, velocity_ms) {
  return velocity_ms > 0 ? (headLoss_m * 2 * G) / velocity_ms ** 2 : 0;
}

export function theoreticalKEnlargement(area1_m2, area2_m2) {
  return (1 - area1_m2 / area2_m2) ** 2;
}

export function runFullSimulation(inputs) {
  const fitting = FITTINGS[inputs.fitting] ?? FITTINGS.enlargement;
  const smallArea = pipeArea(inputs.smallDiameter_mm / 1000);
  const largeArea = pipeArea(inputs.largeDiameter_mm / 1000);
  const area_m2 = inputs.fitting === 'enlargement' ? smallArea : pipeArea(fitting.diameter_m);
  const rows = inputs.runs.map((run, index) => {
    const Q = run.Q_m3s ?? run.flow_lpm / 60000;
    const V = Q / area_m2;
    return { ...run, id: index + 1, Q, V, V2: V ** 2, K: lossCoefficient(run.headLoss_m, V) };
  });
  const theoreticalK = inputs.fitting === 'enlargement' ? theoreticalKEnlargement(smallArea, largeArea) : fitting.referenceK;
  return {
    table: rows,
    summary: { K: rows.reduce((sum, row) => sum + row.K, 0) / rows.length, theoreticalK },
    chartSeries: rows.map((row) => ({ ...row, x: row.V2, y: row.headLoss_m })),
  };
}
