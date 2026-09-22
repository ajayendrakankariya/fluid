import * as calc from '../../physics/orifice';
import { ORIFICE_PRESETS } from '../../data/presets/orifice';

export default {
  slug: 'orifice', manualExperimentNo: 1,
  title: 'Coefficient of Discharge of an Orifice',
  shortTitle: 'Orifice', status: 'available',
  aim: 'Determine the coefficient of discharge of an orifice by the constant-head method.',
  theory: { formulae: ['a = (pi/4)d^2', 'Qth = a sqrt(2gh)', 'Qa = flow rate', 'Cd = Qa / Qth'], assumptions: ['Steady head', 'Free jet discharge', 'Incompressible water'] },
  apparatus: { items: ['Orifice tank', 'Piezometer', 'Meter scale', 'Collecting tank', 'Stopwatch'], svgKey: 'orifice' },
  given: { orificeDiameter_mm: 12 }, calc, presets: ORIFICE_PRESETS,
  defaults: { diameter_mm: 12 }, dataNote: 'The scan reports Cd near 0.74. Verify this unusually high value against the original instructor sheet; sharp-edged orifices commonly fall near 0.60–0.65.',
};
