import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

// App Pages
import Dashboard from "./pages/app/Dashboard";
import CreatePost from "./pages/app/CreatePost";
import ContentCalendar from "./pages/app/ContentCalendar";
import Analytics from "./pages/app/Analytics";
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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* App Routes */}
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/create" element={<CreatePost />} />
          <Route path="/app/calendar" element={<ContentCalendar />} />
          <Route path="/app/analytics" element={<Analytics />} />
          <Route path="/app/linkedin" element={<LinkedInConnect />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/billing" element={<Billing />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/ai-models" element={<AdminAIModels />} />
          <Route path="/admin/logs" element={<AdminLogs />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
