
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EducationDashboard } from './pages/EducationDashboard';
import { LifeDashboard } from './pages/LifeDashboard';
import { UnifiedCalendar } from './pages/UnifiedCalendar';
import { BrainDump } from './pages/BrainDump';
import { Projects } from './pages/Projects';
import { AllTasks } from './pages/AllTasks';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { StrategyRoadmap } from './pages/StrategyRoadmap';
import { Profile } from './pages/Profile'; // Import Profile
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const { user, isLoading, onboardingCompleted, userRole } = useApp();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen w-full bg-background flex items-center justify-center text-primary">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // ADMIN BYPASS: Admins do not need to do onboarding
    if (userRole === 'admin') {
        return children;
    }

    if (!onboardingCompleted && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
              <ProtectedRoute>
                  <OnboardingWizard />
              </ProtectedRoute>
          } />

          {/* Protected App Routes */}
          <Route path="/app" element={
              <ProtectedRoute>
                  <Layout />
              </ProtectedRoute>
          }>
            <Route index element={<LifeDashboard />} />
            <Route path="work" element={<Dashboard />} />
            <Route path="education" element={<EducationDashboard />} />
            <Route path="calendar" element={<UnifiedCalendar />} />
            <Route path="brain-dump" element={<BrainDump />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<AllTasks />} />
            <Route path="roadmap" element={<StrategyRoadmap />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} /> {/* Added Profile Route */}
          </Route>

          {/* Admin Route */}
          <Route path="/admin" element={
              <ProtectedRoute>
                  <AdminDashboard />
              </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
