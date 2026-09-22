export const G = 9.81;

export function orificeArea(diameter_m) {
  return (Math.PI / 4) * diameter_m ** 2;
}

export function theoreticalDischarge(area_m2, head_m) {
  return area_m2 * Math.sqrt(2 * G * Math.max(head_m, 0));
}

export function actualDischargeFromLpm(flow_lpm) {
  return flow_lpm / 60000;
}

export function coefficientOf(actual, theoretical) {
  return theoretical > 0 ? actual / theoretical : 0;
}

export function runFullSimulation(inputs) {
  const diameter_m = inputs.diameter_mm / 1000;
  const area_m2 = orificeArea(diameter_m);
  const rows = inputs.runs.map((run, index) => {
    const Qth = theoreticalDischarge(area_m2, run.h_m);
    const Qa = run.Qa_m3s ?? actualDischargeFromLpm(run.Qa_lpm);
    return { ...run, id: index + 1, Qth, Qa, Cd: coefficientOf(Qa, Qth) };
  });
  return {
    table: rows,
    summary: { Cd: rows.reduce((sum, row) => sum + row.Cd, 0) / rows.length, area_m2 },
    chartSeries: rows.map((row) => ({ ...row, x: row.Qth, y: row.Qa })),
  };
}
