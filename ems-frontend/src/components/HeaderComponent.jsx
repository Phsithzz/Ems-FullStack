import React, { useState, useEffect } from "react";
import { getAuthUser, logoutApi } from "../services/AuthService";
import { Link, useNavigate } from "react-router-dom";

const HeaderComponent = ({ searchQuery, setSearchQuery }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigator = useNavigate();

  useEffect(() => {
    setCurrentUser(getAuthUser());
  }, []);

  const handleLogout = async () => {
    await logoutApi();
    setCurrentUser(null);
    navigator("/login");
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          placeholder="Search employee by name, email..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35] transition"
        />
      </div>

      {/* Right Action Icons & Auth Profile */}
      <div className="flex items-center gap-4">
        {/* Environment Tag */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          2FA & Pay API Active
        </span>

        {/* User Status / Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
              <span className="text-[10px] font-semibold text-[#FF5C35] uppercase tracking-wider">
                {currentUser.role?.replace("ROLE_", "")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition"
              title="Sign Out"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs font-bold px-4 py-2 bg-[#FF5C35] hover:bg-[#e84f28] text-white rounded-xl shadow-sm transition"
          >
            Sign In with 2FA
          </Link>
        )}
      </div>
    </header>
  );
};

export default HeaderComponent;
