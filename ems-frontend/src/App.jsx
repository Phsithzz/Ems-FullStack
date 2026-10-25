import React, { useState, useEffect } from "react";
import "./App.css";
import EmployeeComponent from "./components/EmployeeComponent";
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import SidebarComponent from "./components/SidebarComponent";
import ListEmployeeComponent from "./components/ListEmployeeComponent";
import LoginComponent from "./components/LoginComponent";
import PaymentComponent from "./components/PaymentComponent";
import CardManagementComponent from "./components/CardManagementComponent";
import LedgerComponent from "./components/LedgerComponent";
import ReconciliationComponent from "./components/ReconciliationComponent";
import { refreshTokenApi } from "./services/AuthService";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

const AppContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  // Attempt silent refresh on app startup using HttpOnly cookie
  useEffect(() => {
    refreshTokenApi().catch(() => {
      // If no valid refresh cookie, user stays as guest or redirects to login when accessing protected resources
    });
  }, []);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FB] text-slate-800 antialiased font-sans">
      {/* Left Sidebar (Matching Dribbble layout) */}
      <SidebarComponent />

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 px-8 py-7 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={<ListEmployeeComponent searchQuery={searchQuery} />}
            />
            <Route
              path="/dashboard"
              element={<ListEmployeeComponent searchQuery={searchQuery} />}
            />
            <Route
              path="/employees"
              element={<ListEmployeeComponent searchQuery={searchQuery} />}
            />
            <Route path="/add-employee" element={<EmployeeComponent />} />
            <Route path="/edit-employee/:id" element={<EmployeeComponent />} />
            <Route path="/payroll" element={<PaymentComponent />} />
            <Route path="/cards" element={<CardManagementComponent />} />
            <Route path="/ledger" element={<LedgerComponent />} />
            <Route path="/reconciliation" element={<ReconciliationComponent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <FooterComponent />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
