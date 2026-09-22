export const G = 9.81;

export function theoreticalTriangular(theta_deg, head_m) {
  const theta = (theta_deg * Math.PI) / 180;
  return (8 / 15) * Math.sqrt(2 * G) * Math.tan(theta / 2) * Math.max(head_m, 0) ** 2.5;
}

export function theoreticalRectangular(length_m, head_m) {
  return (2 / 3) * Math.sqrt(2 * G) * length_m * Math.max(head_m, 0) ** 1.5;
}

export function actualDischargeFromLpm(flow_lpm) {
  return flow_lpm / 60000;
}

export function coefficientOf(actual, theoretical) {
  return theoretical > 0 ? actual / theoretical : 0;
}

export function runFullSimulation(inputs) {
  const isTriangular = inputs.type === 'triangular';
  const exponent = isTriangular ? 2.5 : 1.5;
  const rows = inputs.runs.map((run, index) => {
    const Qth = isTriangular
      ? theoreticalTriangular(inputs.theta_deg, run.h_m)
      : theoreticalRectangular(inputs.length_m, run.h_m);
    const Qa = run.Qa_m3s ?? actualDischargeFromLpm(run.Qa_lpm);
    return {
      ...run,
      id: index + 1,
      Qth,
      Qa,
      Cd: coefficientOf(Qa, Qth),
      x: run.h_m ** exponent,
      exponent,
    };
  });
  return {
    table: rows,
    summary: { Cd: rows.reduce((sum, row) => sum + row.Cd, 0) / rows.length, exponent },
    chartSeries: rows.map((row) => ({ ...row, y: row.Qa })),
  };
}
