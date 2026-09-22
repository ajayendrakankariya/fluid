# Fluid Mechanics Virtual Lab

Interactive web lab for six Fluid Mechanics experiments from the BAMEE204 laboratory manual. Built with React and Vite for coursework and guided virtual experimentation.

Inspired by open educational projects including [jai8806/bernoulli-theorem-virtual-lab](https://github.com/jai8806/bernoulli-theorem-virtual-lab), [Interactive-Bernoulli-Effect-Demo](https://github.com/SAMeh-ZAGhloul/Interactive-Bernoulli-Effect-Demo), [Bernoulli-Principle](https://github.com/aashishbishow/Bernoulli-Principle), and [MathWorks Fluid Mechanics](https://github.com/MathWorks-Teaching-Resources/Fluid-Mechanics) teaching resources.

## Experiments

| Manual experiment | Title | Route slug |
|------------------|-------|------------|
| 1 | Orifice - coefficient of discharge | `orifice` |
| 2 | Rectangular/Triangular notch - coefficient of discharge | `notch` |
| 3 | Venturimeter/Orificemeter - coefficient of discharge | `venturi-orifice` |
| 4 | Bernoulli's theorem | `bernoulli` |
| 5 | Major losses and friction factor | `major-losses` |
| 6 | Minor losses in pipe fittings | `minor-losses` |

## Features

- **Experiment hub** - six experiment cards with links to simulation, theory, apparatus, and results
- **Config-driven pages** - shared generic pages use the experiment registry and physics modules
- **Pure calculation engines** - discharge, coefficient, friction-factor, Reynolds-number, and fitting-loss calculations
- **Bernoulli visualization** - animated particles, piezometer columns, throat annotations, HGL/TEL charts, and live controls
- **Calibrated presets** - canonical datasets based on the supplied manual transcription
- **Results tables** - calculated observations and primary coefficient summaries
- **Lab assistant chat** - Gemini API when configured, with an offline experiment FAQ fallback
- **Responsive layout** - usable on desktop, tablet, and mobile screens

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

The root route opens the experiment hub at `/experiments`. Each experiment exposes:

```text
/experiments/:slug/theory
/experiments/:slug/apparatus
/experiments/:slug/simulation
/experiments/:slug/results
```

The original detailed Bernoulli routes (`/theory`, `/apparatus`, `/simulation`, and `/results`) remain available for compatibility.

### Optional AI chat

```bash
cp .env.example .env
# set GEMINI_API_KEY=your_key_from_https://aistudio.google.com/
```

Without a key, the floating assistant answers common questions from the built-in FAQ. On experiment routes, the active experiment slug is sent to the API so Gemini receives relevant formula and apparatus context.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server + `/api/chat` proxy |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Physics notes

The calculation modules are in `src/physics/` and expose a common `runFullSimulation(inputs)` contract. Each returns an observation table, summary values, and chart-ready series.

### Orifice

\[
a = \frac{\pi d^2}{4}, \qquad Q_{th}=a\sqrt{2gh}, \qquad C_d=\frac{Q_a}{Q_{th}}
\]

The orifice diameter is 12 mm. Flow input is converted from L/min to m3/s.

### Notch

For a triangular notch:

\[
Q_{th}=\frac{8}{15}\sqrt{2g}\tan\left(\frac{\theta}{2}\right)h^{5/2}
\]

For a rectangular notch:

\[
Q_{th}=\frac{2}{3}\sqrt{2g}Lh^{3/2}
\]

### Venturimeter/Orificemeter

\[
h=12.6R, \qquad Q_{th}=\frac{a_1a_2}{\sqrt{a_1^2-a_2^2}}\sqrt{2gh}, \qquad C_d=\frac{Q_a}{Q_{th}}
\]

The factor 12.6 converts differential mercury-manometer deflection into metres of water head.

### Major losses

\[
h_f=\frac{4fLV^2}{2gD}, \qquad f=\frac{h_f2gD}{4LV^2}, \qquad Re=\frac{VD}{\nu}
\]

Water kinematic viscosity is selected from a temperature lookup table.

### Minor losses

\[
h_L=\frac{KV^2}{2g}, \qquad K=\frac{h_L2g}{V^2}
\]

For sudden enlargement, the theoretical comparison is:

\[
K=\left(1-\frac{A_1}{A_2}\right)^2
\]

Bernoulli head form:

\[
\frac{p}{\rho g} + \frac{V^2}{2g} + z = H
\]

Discharge from collecting tank: \(Q = A_T H / t\) with \(A_T = 0.0405\,\mathrm{m}^2\), \(H = 0.10\,\mathrm{m}\).

The Bernoulli presets use canonical \(Q\) so Checkpoint 1 (P1 total head) and Checkpoint 2 (mean total head) match the manual within ±0.001 m. Run `validateCalibration()` in the browser console to verify.

## Data quality notes

The source material is a scanned and partially handwritten manual. Some values are difficult to read or internally inconsistent. The application uses physically consistent placeholders where necessary and marks these locations in the experiment configuration.

- The major-losses pipe diameter is reported as `3 mm` by OCR, which is not realistic for the described bench. The app currently uses a 25 mm placeholder.
- Some reported coefficients, especially the orifice, notch, and venturi values, differ from common textbook ranges and should be checked against the original instructor sheet.
- Presets are intended for demonstrating the calculation workflow, not for replacing measured laboratory observations.

## Project layout

```text
api/chat.js                         Gemini proxy, experiment context, rate limit
src/config/experiments/              Experiment registry and page metadata
src/physics/                         Pure calculation engines for all experiments
src/data/presets/                    Calibrated/default observation datasets
src/pages/                           Generic hub, theory, apparatus, simulation, results pages
src/components/                      Navigation, Bernoulli UI, charts, tables, chat
src/physics/bernoulli.js              Original detailed Bernoulli engine
```

## Validation

```bash
npm run build
npm run lint
```

The build currently succeeds. Lint may report unused-variable warnings in legacy visualization files; these do not prevent the production bundle from being generated.

## Course

BAMEE204 — Fluid Mechanics and Machinery · Fall 26–27
