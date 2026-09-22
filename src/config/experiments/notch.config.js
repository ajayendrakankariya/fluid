import * as calc from '../../physics/notch';
import { NOTCH_PRESETS } from '../../data/presets/notch';

export default {
  slug: 'notch', manualExperimentNo: 2,
  title: 'Coefficient of Discharge of a Rectangular/Triangular Notch',
  shortTitle: 'Notch', status: 'available',
  aim: 'Study flow over a triangular or rectangular notch and calibrate it for free-surface discharge measurement.',
  theory: { formulae: ['Qth triangular = (8/15)sqrt(2g) tan(theta/2) h^(5/2)', 'Qth rectangular = (2/3)sqrt(2g)Lh^(3/2)', 'Cd = Qa / Qth'], assumptions: ['Steady free-surface flow', 'Sharp crest', 'Measured head is above the sill'] },
  apparatus: { items: ['Flume', 'Triangular/rectangular notch', 'Hook gauge', 'Stopwatch', 'Scale'], svgKey: 'notch' },
  given: { theta_deg: 90, length_m: 0.20 }, calc, presets: NOTCH_PRESETS,
  defaults: { type: 'triangular', theta_deg: 90, length_m: 0.20 }, dataNote: 'The scanned sheet is partly illegible. The 90-degree triangular-notch angle is clear; numerical runs are physically consistent placeholders.',
};
