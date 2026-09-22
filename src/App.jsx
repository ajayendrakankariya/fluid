import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import TheoryPage from './components/TheoryPage';
import ApparatusPage from './components/ApparatusPage';
import SimulationPage from './components/SimulationPage';
import ResultsPage from './components/ResultsPage';
import ChatbotWidget from './components/ChatbotWidget';
import HomePage from './pages/HomePage';
import ExperimentTheoryPage from './pages/ExperimentTheoryPage';
import ExperimentApparatusPage from './pages/ExperimentApparatusPage';
import ExperimentSimulationPage from './pages/ExperimentSimulationPage';
import ExperimentResultsPage from './pages/ExperimentResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/experiments" replace />} />
        <Route path="/experiments" element={<HomePage />} />
        <Route path="/experiments/orifice/theory" element={<ExperimentTheoryPage />} />
        <Route path="/experiments/orifice/apparatus" element={<ExperimentApparatusPage />} />
        <Route path="/experiments/orifice/simulation" element={<ExperimentSimulationPage />} />
        <Route path="/experiments/orifice/results" element={<ExperimentResultsPage />} />
        <Route path="/experiments/notch/theory" element={<ExperimentTheoryPage />} />
        <Route path="/experiments/notch/apparatus" element={<ExperimentApparatusPage />} />
        <Route path="/experiments/notch/simulation" element={<ExperimentSimulationPage />} />
        <Route path="/experiments/notch/results" element={<ExperimentResultsPage />} />
        <Route path="/experiments/venturi-orifice/theory" element={<ExperimentTheoryPage />} />
        <Route path="/experiments/venturi-orifice/apparatus" element={<ExperimentApparatusPage />} />
        <Route path="/experiments/venturi-orifice/simulation" element={<ExperimentSimulationPage />} />
        <Route path="/experiments/venturi-orifice/results" element={<ExperimentResultsPage />} />
        <Route path="/experiments/major-losses/theory" element={<ExperimentTheoryPage />} />
        <Route path="/experiments/major-losses/apparatus" element={<ExperimentApparatusPage />} />
        <Route path="/experiments/major-losses/simulation" element={<ExperimentSimulationPage />} />
        <Route path="/experiments/major-losses/results" element={<ExperimentResultsPage />} />
        <Route path="/experiments/minor-losses/theory" element={<ExperimentTheoryPage />} />
        <Route path="/experiments/minor-losses/apparatus" element={<ExperimentApparatusPage />} />
        <Route path="/experiments/minor-losses/simulation" element={<ExperimentSimulationPage />} />
        <Route path="/experiments/minor-losses/results" element={<ExperimentResultsPage />} />
        <Route path="/experiments/bernoulli/theory" element={<TheoryPage />} />
        <Route path="/experiments/bernoulli/apparatus" element={<ApparatusPage />} />
        <Route path="/experiments/bernoulli/simulation" element={<SimulationPage />} />
        <Route path="/experiments/bernoulli/results" element={<ResultsPage />} />
        <Route path="/theory" element={<TheoryPage />} />
        <Route path="/apparatus" element={<ApparatusPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  );
}

