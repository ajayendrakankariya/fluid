import * as calc from '../../physics/majorLoss';
import { MAJOR_LOSS_PRESETS } from '../../data/presets/majorLoss';

export default {
  slug: 'major-losses', manualExperimentNo: 5,
  title: 'Estimation of Major Losses in a Pipe', shortTitle: 'Major Losses', status: 'available',
  aim: 'Determine pipe friction losses and estimate the Darcy friction factor.',
  theory: { formulae: ['hf = 4fLV^2/(2gD)', 'f = hf 2gD/(4LV^2)', 'Re = VD/nu'], assumptions: ['Fully developed pipe flow', 'Constant pipe diameter', 'Water properties depend on temperature'] },
  apparatus: { items: ['Test pipe with gate valve', 'Hydraulic bench', 'Digital manometer', 'Measuring jar', 'Stopwatch'], svgKey: 'pipe' },
  given: { length_mm: 500, diameter_mm: 25 }, calc, presets: MAJOR_LOSS_PRESETS,
  defaults: { length_m: 0.5, diameter_mm: 25, temperature_c: 20 }, dataNote: 'The original scan reads the pipe diameter as 3 mm, which is almost certainly OCR corruption. This implementation uses a 25 mm placeholder until the original sheet is checked.',
};
