import * as calc from '../../physics/venturiOrifice';
import { VENTURI_ORIFICE_PRESETS } from '../../data/presets/venturiOrifice';

export default {
  slug: 'venturi-orifice', manualExperimentNo: 3,
  title: 'Coefficient of Discharge of a Venturimeter/Orificemeter',
  shortTitle: 'Venturi / Orifice', status: 'available',
  aim: 'Determine the coefficient of discharge of a venturimeter or orificemeter using a differential mercury manometer.',
  theory: { formulae: ['h = 12.6R', 'Qth = a1a2 sqrt(2gh) / sqrt(a1^2-a2^2)', 'Cd = Qa / Qth'], assumptions: ['Steady confined flow', 'Mercury-water conversion factor 12.6', 'Measured pressure difference is differential head'] },
  apparatus: { items: ['Hydraulic bench', 'Venturimeter', 'Orifice plate', 'Differential mercury manometer', 'Stopwatch'], svgKey: 'venturi-orifice' },
  given: { pipeDiameter_mm: 26, venturiDiameter_mm: 14, orificeDiameter_mm: 17 }, calc, presets: VENTURI_ORIFICE_PRESETS,
  defaults: { meter: 'venturi', pipeDiameter_mm: 26, venturi: { diameter_mm: 14 }, orifice: { diameter_mm: 17 } }, dataNote: 'Pipe and meter diameters are clear in the scanned sheet. The reported venturi coefficient is lower than typical textbook values and should be checked against the original sheet.',
};
