import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WatchMapPage from './pages/WatchMapPage';
import EpisodeDetailPage from './pages/EpisodeDetailPage';
import LearningPage from './pages/LearningPage';
import ReviewPage from './pages/ReviewPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch-map" element={<WatchMapPage />} />
              <Route path="/episode/:episodeId" element={<EpisodeDetailPage />} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/learning/:episodeId" element={<LearningPage />} />
              <Route path="/learning/:episodeId/mini" element={<LearningPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
}
