import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../store/useUIStore";

const SidebarComponent = () => {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const menuSections = [
    {
      title: "MAIN",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          badge: null,
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: "Inbox",
          path: "/inbox",
          badge: "3",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          name: "Calendar & Todos",
          path: "/calendar",
          badge: null,
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "RECRUITMENT & STAFF",
      items: [
        {
          name: "Employees",
          path: "/employees",
          alias: ["/", "/employees", "/add-employee"],
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          name: "Candidates",
          path: "/candidates",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          name: "My Referrals",
          path: "/referrals",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "PAY & CARD (FINTECH)",
      items: [
        {
          name: "Payroll & Payouts",
          path: "/payroll",
          badge: "WorkPay",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: "Corporate Cards",
          path: "/cards",
          badge: "Card",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        },
        {
          name: "Ledger Audit",
          path: "/ledger",
          badge: "Audit",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: "Reconciliation & Kafka",
          path: "/reconciliation",
          badge: "Live",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "ORGANIZATION",
      items: [
        {
          name: "Structure",
          path: "/structure",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
        },
        {
          name: "Reports & Logs",
          path: "/reports",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          name: "Settings",
          path: "/settings",
          icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (item) => {
    if (item.alias) {
      return (
        item.alias.includes(location.pathname) ||
        location.pathname.startsWith("/edit-employee")
      );
    }
    return location.pathname === item.path;
  };

  return (
    <aside
      className={`${
        isSidebarCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-slate-100 flex-shrink-0 flex flex-col justify-between min-h-screen transition-all duration-300 ease-in-out z-30 select-none`}
    >
      <div>
        {/* Brand Header with Collapse Toggle */}
        <div
          className={`h-20 flex items-center border-b border-slate-50 transition-all ${
            isSidebarCollapsed ? "justify-center px-2" : "justify-between px-6"
          }`}
        >
          {!isSidebarCollapsed ? (
            <>
              <Link to="/" className="flex items-center gap-3 group overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                  W
                </div>
                <div className="truncate">
                  <span className="font-extrabold text-slate-800 text-base tracking-tight block">
                    Work<span className="text-[#4F46E5]">Pay</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block -mt-0.5">
                    Enterprise Platform
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Collapse Sidebar"
                className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Link to="/" title="WorkPay Platform">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform cursor-pointer">
                  W
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Expand Sidebar"
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={`py-6 space-y-6 ${isSidebarCollapsed ? "px-2" : "px-4"}`}>
          {menuSections.map((section, idx) => (
            <div key={idx}>
              {!isSidebarCollapsed ? (
                <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                  {section.title}
                </p>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={`flex items-center ${
                        isSidebarCollapsed
                          ? "justify-center p-3"
                          : "justify-between px-3.5 py-2.5"
                      } rounded-xl text-sm font-medium transition-all group relative ${
                        active
                          ? "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
                        <span className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"}>
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on hover when sidebar is collapsed */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {item.name}
                          {item.badge && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500 text-[10px]">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Mini Profile at bottom */}
      <div className={`border-t border-slate-100 ${isSidebarCollapsed ? "p-3" : "p-4"}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3 p-2"} rounded-xl bg-slate-50/70`}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs flex-shrink-0"
            title="Phoosith - Backend Engineer"
          />
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Phoosith</p>
              <p className="text-[11px] text-slate-400 truncate">Backend Engineer</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarComponent;
