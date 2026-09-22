export { PRESET_300MM, PRESET_350MM } from '../physics/bernoulli';

export const DEFAULT_CUSTOM = {
  label: 'Custom',
  deliveryHead_mm: 270,
  time_s: 26.3,
  riseHeight_m: 0.10,
  // Starts from 300mm preset values — edit freely in custom mode
  pressureReadings_mm: [265, 252, 233, 196, 173, 155, 110, 214, 221, 202],
};
