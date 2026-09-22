import orifice from './orifice.config';
import notch from './notch.config';
import venturiOrifice from './venturiOrifice.config';
import majorLosses from './majorLoss.config';
import minorLosses from './minorLoss.config';
import bernoulli from './bernoulli.config';

export const EXPERIMENTS = { orifice, notch, 'venturi-orifice': venturiOrifice, bernoulli, 'major-losses': majorLosses, 'minor-losses': minorLosses };
export const EXPERIMENT_LIST = Object.values(EXPERIMENTS);
export function getExperiment(slug) { return EXPERIMENTS[slug] ?? null; }
