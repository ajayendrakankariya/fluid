export const G = 9.81;

export const VISCOSITY_BY_TEMPERATURE = {
  15: 1.139e-6,
  20: 1.004e-6,
  25: 0.893e-6,
  30: 0.801e-6,
};

export function viscosityAtTemperature(temperature_c) {
  const points = Object.keys(VISCOSITY_BY_TEMPERATURE).map(Number).sort((a, b) => a - b);
  const nearest = points.reduce((best, value) => Math.abs(value - temperature_c) < Math.abs(best - temperature_c) ? value : best, points[0]);
  return VISCOSITY_BY_TEMPERATURE[nearest];
}

export function pipeArea(diameter_m) {
  return (Math.PI / 4) * diameter_m ** 2;
}

export function velocity(Q_m3s, area_m2) {
  return area_m2 > 0 ? Q_m3s / area_m2 : 0;
}

export function frictionFactor(headLoss_m, length_m, diameter_m, velocity_ms) {
  return velocity_ms > 0 ? (headLoss_m * 2 * G * diameter_m) / (4 * length_m * velocity_ms ** 2) : 0;
}

export function reynoldsNumber(velocity_ms, diameter_m, viscosity_m2s) {
  return (velocity_ms * diameter_m) / viscosity_m2s;
}

export function runFullSimulation(inputs) {
  const diameter_m = inputs.diameter_mm / 1000;
  const area_m2 = pipeArea(diameter_m);
  const viscosity_m2s = viscosityAtTemperature(inputs.temperature_c);
  const rows = inputs.runs.map((run, index) => {
    const Q = run.Q_m3s ?? run.flow_lpm / 60000;
    const V = velocity(Q, area_m2);
    const f = frictionFactor(run.headLoss_m, inputs.length_m, diameter_m, V);
    return { ...run, id: index + 1, Q, V, V2: V ** 2, f, Re: reynoldsNumber(V, diameter_m, viscosity_m2s) };
  });
  return {
    table: rows,
    summary: { f: rows.reduce((sum, row) => sum + row.f, 0) / rows.length, area_m2, viscosity_m2s },
    chartSeries: rows.map((row) => ({ ...row, x: row.V2, y: row.headLoss_m })),
  };
}
