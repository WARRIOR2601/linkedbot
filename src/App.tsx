import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import DiagnosticsPanel from "@/components/auth/DiagnosticsPanel";

// Public Pages
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Onboarding from "./pages/Onboarding";
import AccountDisabled from "./pages/AccountDisabled";
import NotFound from "./pages/NotFound";

// App Pages
import Dashboard from "./pages/app/Dashboard";
import CreatePost from "./pages/app/CreatePost";
import ContentCalendar from "./pages/app/ContentCalendar";
import Analytics from "./pages/app/Analytics";
import TrainAI from "./pages/app/TrainAI";
import LinkedInConnect from "./pages/app/LinkedInConnect";
import Settings from "./pages/app/Settings";
import Billing from "./pages/app/Billing";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAIModels from "./pages/admin/AdminAIModels";
import AdminLogs from "./pages/admin/AdminLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes - No auth required */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Auth Routes - Redirect if already logged in */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Account Disabled - Accessible only when suspended */}
            <Route path="/account-disabled" element={<AccountDisabled />} />

            {/* Onboarding - Protected but with special handling */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* Protected App Routes */}
            <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/app/calendar" element={<ProtectedRoute><ContentCalendar /></ProtectedRoute>} />
            <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/app/train-ai" element={<ProtectedRoute><TrainAI /></ProtectedRoute>} />
            <Route path="/app/linkedin" element={<ProtectedRoute><LinkedInConnect /></ProtectedRoute>} />
            <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/app/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

            {/* Admin Routes - Also protected */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
            <Route path="/admin/ai-models" element={<ProtectedRoute><AdminAIModels /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Diagnostics Panel - Always visible for debugging */}
          <DiagnosticsPanel />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
