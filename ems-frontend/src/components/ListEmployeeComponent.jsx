import React, { useEffect, useState } from "react";
import { deleteEmployee, listEmployees } from "../services/EmployeeService";
import { useNavigate } from "react-router-dom";

const ListEmployeeComponent = ({ searchQuery }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigator = useNavigate();

  useEffect(() => {
    getAllEmployees();
  }, []);

  const getAllEmployees = async () => {
    try {
      const response = await listEmployees();
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const addNewEmployee = () => {
    navigator("/add-employee");
  };

  const updateEmployee = (id) => {
    navigator(`/edit-employee/${id}`);
  };

  const removeEmployee = async (id) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      try {
        await deleteEmployee(id);
        getAllEmployees();
      } catch (err) {
        console.error("Error deleting employee:", err);
      }
    }
  };

  // Preset avatars for realistic fintech/corporate team showcase
  const avatarList = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces",
  ];

  // Helper metadata to match Dribbble design
  const getEmployeeMeta = (employee, index) => {
    const departments = [
      "Pay & Settlement",
      "Card Infrastructure",
      "Crypto Ledger",
      "Risk & Compliance",
      "Transaction Processing",
    ];
    const roles = [
      "Backend Engineer",
      "Distributed Systems Engineer",
      "Payment Systems Architect",
      "Staff Software Engineer",
      "Fintech Core Developer",
    ];
    const dept = departments[index % departments.length];
    const role = roles[index % roles.length];
    const avatar = avatarList[index % avatarList.length];
    const hiredDate = `10/${((index * 3 + 12) % 28) + 1}/24`;
    const phone = `(555) 019-${1000 + (employee.id * 13) % 9000}`;
    const cardStatus = index % 2 === 0 ? "Active Binance Card" : "Pending Issue";

    return { dept, role, avatar, hiredDate, phone, cardStatus };
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(q) || emp.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-7">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Counter Title like Dribbble */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-[#FF5C35]">
            {filteredEmployees.length}
          </span>
          <span className="text-3xl font-extrabold text-slate-800">
            Employee{filteredEmployees.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "all" ? "active" : "all")
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </button>

          {/* Add Employee Button (Warm Orange like screenshot) */}
          <button
            onClick={addNewEmployee}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5C35] hover:bg-[#e84f28] text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-lg leading-none">+</span>
            Add Candidate
          </button>
        </div>
      </div>

      {/* Grid of Cards (Dribbble 3-column layout) */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-[#FF5C35] mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">No employees found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Get started by adding a new candidate to the organization's Pay & Card roster.
          </p>
          <button
            onClick={addNewEmployee}
            className="mt-5 px-5 py-2.5 bg-[#FF5C35] text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-[#e84f28] transition"
          >
            + Add First Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((employee, idx) => {
            const meta = getEmployeeMeta(employee, idx);
            const isMenuOpen = openMenuId === employee.id;

            return (
              <div
                key={employee.id}
                className="bg-white rounded-2xl p-6 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-orange-100 transition-all duration-200 relative group"
              >
                {/* Top: Avatar + Status Dot + Three-dot menu */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={meta.avatar}
                      alt={employee.firstName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(isMenuOpen ? null : employee.id)
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            updateEmployee(employee.id);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            removeEmployee(employee.id);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Candidate
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Title */}
                <div className="mt-3.5">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#FF5C35] transition-colors truncate">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {meta.role}
                  </p>
                </div>

                {/* 2-Column Metadata Box (Department & Hired Date) */}
                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 text-left">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Department
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block truncate">
                      {meta.dept}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Hired Date
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block">
                      {meta.hiredDate}
                    </span>
                  </div>
                </div>

                {/* Contact Rows with Icons (Email & Phone) */}
                <div className="mt-4 pt-3 space-y-2 text-xs text-slate-500 border-t border-slate-50">
                  <div className="flex items-center gap-2.5 truncate">
                    <svg
                      className="w-4 h-4 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate hover:text-slate-800 cursor-pointer">
                      {employee.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <svg
                        className="w-4 h-4 text-slate-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{meta.phone}</span>
                    </div>

                    {/* Quick Edit/Delete buttons on hover */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => updateEmployee(employee.id)}
                        className="p-1 hover:text-[#FF5C35] text-slate-400"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeEmployee(employee.id)}
                        className="p-1 hover:text-rose-600 text-slate-400"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListEmployeeComponent;
