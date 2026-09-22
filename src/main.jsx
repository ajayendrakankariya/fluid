import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { validateCalibration } from './physics/bernoulli.js';

// Validate physics engine against calibration presets on startup
validateCalibration();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
