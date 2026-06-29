import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ProfileSetup from './features/profile/ProfileSetup';
import Dashboard from './features/dashboard/Dashboard';
import Analytics from './features/analytics/Analytics';
import AIReviewPage from './features/review/AIReviewPage';
import GoalsPage from './features/goals/GoalsPage';
import SupplementsPage from './features/supplements/SupplementsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SetupGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.profileComplete) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/setup"     element={<SetupGuard><ProfileSetup /></SetupGuard>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/review"    element={<ProtectedRoute><AIReviewPage /></ProtectedRoute>} />
      <Route path="/goals"       element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
      <Route path="/supplements" element={<ProtectedRoute><SupplementsPage /></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
