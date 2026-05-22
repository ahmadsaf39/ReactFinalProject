import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageWrapper from './components/layout/PageWrapper';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import Dashboard from './features/dashboard/Dashboard';
import NodesPage from './features/nodes/NodesPage';
import LinksPage from './features/links/LinksPage';
import RoutingPage from './features/routing/RoutingPage';
import NetworkMapPage from './features/network/NetworkMapPage';
import SimulationPage from './features/simulation/SimulationPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PageWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="nodes" element={<NodesPage />} />
            <Route path="links" element={<LinksPage />} />
            <Route path="routing" element={<RoutingPage />} />
            <Route path="network" element={<NetworkMapPage />} />
            <Route path="simulation" element={<SimulationPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
