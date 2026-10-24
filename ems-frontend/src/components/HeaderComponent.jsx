import React from "react";
import { Link } from "react-router-dom";

const HeaderComponent = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-white text-xl font-semibold tracking-wide hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          <span className="p-1.5 bg-indigo-600 rounded-lg text-sm font-bold shadow text-white">
            EMS
          </span>
          Employee Management System
        </Link>
        <a
          href="https://www.javaguides.net"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white text-sm transition-colors hidden sm:block"
        >
          JavaGuides
        </a>
      </nav>
    </header>
  );
};

export default HeaderComponent;
