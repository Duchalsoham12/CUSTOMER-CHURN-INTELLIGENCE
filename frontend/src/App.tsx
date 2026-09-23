import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/Pages";
import { RealDashboardPage } from "./pages/RealDashboardPage";
import { LiveModelPage } from "./pages/LiveModelPage";
import { LiveRetentionPage } from "./pages/LiveRetentionPage";
import { LiveCustomersPage } from "./pages/LiveCustomersPage";
import { LiveCustomerProfilePage } from "./pages/LiveCustomerProfilePage";
import { LiveChurnPage, LiveRevenuePage, LiveSegmentsPage, UnavailableAnalyticsPage } from "./pages/LiveAnalyticsPages";
import { LiveUploadPage } from "./pages/LiveUploadPage";
import { LiveSimulatorPage } from "./pages/LiveSimulatorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RealDashboardPage />} />
          <Route path="/customers" element={<LiveCustomersPage />} />
          <Route path="/customers/:id" element={<LiveCustomerProfilePage />} />
          <Route path="/churn" element={<LiveChurnPage />} />
          <Route path="/segments" element={<LiveSegmentsPage />} />
          <Route
            path="/cohorts"
            element={
              <UnavailableAnalyticsPage
                title="Cohort analysis unavailable"
                description="The current source contains no signup or transaction dates."
              />
            }
          />
          <Route path="/revenue-risk" element={<LiveRevenuePage />} />
          <Route path="/retention" element={<LiveRetentionPage />} />
          <Route path="/simulator" element={<LiveSimulatorPage />} />
          <Route path="/model" element={<LiveModelPage />} />
          <Route path="/upload" element={<LiveUploadPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
