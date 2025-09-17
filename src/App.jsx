// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Assessments from "./pages/Assessments";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";
import CreateJobModal from "./components/CreateJobModal";
import CandidateProfile from "./pages/CandidateProfile";
import JobDetail from "./pages/JobDetail";
import AssessmentBuilder from "./components/assessment/AssessmentBuilder";
import AssessmentView from "./components/assessment/AssessmentView";
import CreateJob from "./components/jobs/CreateJob";
import Layout from "./pages/Layout";
import AssessmentViewer from "./components/assessment/AssessmentViewer";
import CreateCandidate from "./components/candidate/CreateCandidate";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout><Dashboard /></Layout>
        } />
        <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
        <Route path="/candidates" element={<Layout> <Candidates /></Layout>} />
        <Route path="/assessment" element={<Layout><Assessments /></Layout>} />
        <Route path="/assessment/view/:id" element={<Layout><AssessmentViewer /></Layout>} />
        <Route path="/candidate/:id" element={<Layout> <CandidateProfile /></Layout>} />
        <Route path="/candidate/create" element={<Layout> <CreateCandidate /></Layout>} />
        <Route path="/job/:id" element={<Layout><JobDetail /> </Layout>} />
        <Route path="/assessment/create/:id" element={<Layout><AssessmentBuilder /></Layout>} />
        <Route
          path="/assessment/edit/:id"
          element={<AssessmentBuilder mode="edit" />}
        />
        <Route path="/assessment/view/:id" element={<AssessmentView />} />
        <Route path="/job/create" element={<Layout><CreateJob /></Layout>} />
      </Routes>
    </Router>
  );
}
