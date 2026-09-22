export const G = 9.81;
export const MERCURY_WATER_FACTOR = 12.6;

export function pipeArea(diameter_m) {
  return (Math.PI / 4) * diameter_m ** 2;
}

export function equivalentHead(deflection_m, factor = MERCURY_WATER_FACTOR) {
  return deflection_m * factor;
}

export function theoreticalDischarge(area1_m2, area2_m2, head_m) {
  const denominator = Math.sqrt(Math.max(area1_m2 ** 2 - area2_m2 ** 2, Number.EPSILON));
  return (area1_m2 * area2_m2 * Math.sqrt(2 * G * Math.max(head_m, 0))) / denominator;
}

export function coefficientOf(actual, theoretical) {
  return theoretical > 0 ? actual / theoretical : 0;
}

export function runFullSimulation(inputs) {
  const meter = inputs.meter === 'orifice' ? inputs.orifice : inputs.venturi;
  const area1_m2 = pipeArea(inputs.pipeDiameter_mm / 1000);
  const area2_m2 = pipeArea(meter.diameter_mm / 1000);
  const rows = inputs.runs.map((run, index) => {
    const head_m = equivalentHead(run.deflection_mm / 1000);
    const Qth = theoreticalDischarge(area1_m2, area2_m2, head_m);
    const Qa = run.Qa_m3s ?? run.Qa_lpm / 60000;
    return { ...run, id: index + 1, head_m, Qth, Qa, Cd: coefficientOf(Qa, Qth), x: Math.sqrt(head_m), y: Qa };
  });
  return {
    table: rows,
    summary: { Cd: rows.reduce((sum, row) => sum + row.Cd, 0) / rows.length, area1_m2, area2_m2 },
    chartSeries: rows,
  };
}
