import { PRESET_300MM, PRESET_350MM } from '../../data/presets/bernoulli';

export default {
  slug: 'bernoulli', manualExperimentNo: 4, title: "Bernoulli's Theorem", shortTitle: 'Bernoulli', status: 'available',
  aim: "Verify Bernoulli's theorem using a venturimeter.",
  theory: { formulae: ['p/rho g + V^2/(2g) + z = H'], assumptions: ['Steady flow', 'Incompressible flow', 'Inviscid flow along a streamline'] },
  apparatus: { items: ['Bernoulli apparatus', 'Digital hydraulic bench', 'Stopwatch'], svgKey: 'bernoulli' },
  presets: [PRESET_300MM, PRESET_350MM], dataNote: 'Bernoulli is the original verified implementation and retains its existing calibrated physics engine.',
};
