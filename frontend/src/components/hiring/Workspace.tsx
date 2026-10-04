import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HiringHome } from '../../pages/HiringHome';
import { JobDetails } from '../../pages/JobDetails';
import { ApplicationForm } from './ApplicationForm';
import { ApplicationSuccess } from './ApplicationSuccess';
import { HrLogin } from './hr/HrLogin';
import { HrDashboard } from './hr/HrDashboard';
import { HrProtectedRoute } from './common/HrProtectedRoute';
import { TechnicalAssessment } from './TechnicalAssessment';
import { JobForm } from './hr/JobForm';
import { ApplicationDetails } from './hr/ApplicationDetails';
import { JobSpace } from './hr/JobSpace';

export const Workspace = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HiringHome />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs/:id/apply" element={<ApplicationForm />} />
        <Route path="/application-success" element={<ApplicationSuccess />} />
        <Route
          path="/technical-assessment/:candidateId"
          element={<TechnicalAssessment />}
        />
        {/* HR Routes */}
        <Route path="/hr/login" element={<HrLogin />} />
        <Route
          path="/hr/job-space"
          element={
            <HrProtectedRoute>
              <JobSpace />
            </HrProtectedRoute>
          }
        />
        <Route
          path="/hr/dashboard"
          element={
            <HrProtectedRoute>
              <HrDashboard />
            </HrProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs/create"
          element={
            <HrProtectedRoute>
              <JobForm /> {/* Use JobForm for creation */}
            </HrProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs/edit/:id" // New route for editing jobs
          element={
            <HrProtectedRoute>
              <JobForm /> {/* Use JobForm for editing */}
            </HrProtectedRoute>
          }
        />
        <Route
          path="/hr/applications/:id"
          element={
            <HrProtectedRoute>
              <ApplicationDetails />
            </HrProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
