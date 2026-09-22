import * as calc from '../../physics/minorLoss';
import { MINOR_LOSS_PRESETS } from '../../data/presets/minorLoss';

export default {
  slug: 'minor-losses', manualExperimentNo: 6,
  title: 'Estimation of Minor Losses in Pipe Fittings', shortTitle: 'Minor Losses', status: 'available',
  aim: 'Determine loss coefficients for enlargement, contraction, bends, and elbows.',
  theory: { formulae: ['hL = KV^2/(2g)', 'K = hL 2g/V^2', 'K enlargement = (1-A1/A2)^2'], assumptions: ['Mean velocity represents the fitting section', 'Pressure taps bracket the fitting', 'High-Reynolds-number K is approximately constant'] },
  apparatus: { items: ['Manifold', 'Sudden enlargement', 'Sudden contraction', 'Short bend', 'Elbow', 'Differential manometer'], svgKey: 'fittings' },
  given: { smallDiameter_mm: 18, largeDiameter_mm: 24 }, calc, presets: MINOR_LOSS_PRESETS,
  defaults: { fitting: 'enlargement', smallDiameter_mm: 18, largeDiameter_mm: 24 }, dataNote: 'The four fitting datasets are physically consistent placeholders based on the scanned ranges. Confirm individual manometer readings against the original sheet.',
};
