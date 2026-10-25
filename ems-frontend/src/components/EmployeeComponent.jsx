import React, { useEffect, useState } from "react";
import {
  useEmployee,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../hooks/useEmployeeQueries";
import { useNavigate, useParams, Link } from "react-router-dom";

const EmployeeComponent = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const { id } = useParams();
  const navigator = useNavigate();

  const { data: existingEmployee } = useEmployee(id);
  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();

  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (existingEmployee) {
      setFirstName(existingEmployee.firstName || "");
      setLastName(existingEmployee.lastName || "");
      setEmail(existingEmployee.email || "");
    }
  }, [existingEmployee]);

  const saveOrUpdateEmployee = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const employee = { firstName, lastName, email };

      if (id) {
        updateMutation.mutate(
          { id, data: employee },
          {
            onSuccess: () => navigator("/employees"),
            onError: (err) => console.error("Error updating employee:", err),
          }
        );
      } else {
        createMutation.mutate(employee, {
          onSuccess: () => navigator("/employees"),
          onError: (err) => console.error("Error creating employee:", err),
        });
      }
    }
  };

  const validateForm = () => {
    let valid = true;
    const errorCopy = { ...error };

    if (firstName.trim()) {
      errorCopy.firstName = "";
    } else {
      errorCopy.firstName = "First name is required";
      valid = false;
    }

    if (lastName.trim()) {
      errorCopy.lastName = "";
    } else {
      errorCopy.lastName = "Last name is required";
      valid = false;
    }

    if (email.trim()) {
      errorCopy.email = "";
    } else {
      errorCopy.email = "Email is required";
      valid = false;
    }

    setError(errorCopy);
    return valid;
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
        <Link to="/employees" className="hover:text-slate-600 transition">
          Employees
        </Link>
        <span>/</span>
        <span className="text-[#FF5C35]">
          {id ? `Update #${id}` : "Add New Candidate"}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5C35]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {id ? "Update Candidate Profile" : "Add New Candidate"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {id
                ? "Update organization records for this team member."
                : "Fill in candidate details to enroll into WorkPay Platform."}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bessie"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  error.firstName
                    ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#FF5C35] focus:ring-[#FF5C35]/15"
                }`}
              />
              {error.firstName && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1.5">
                  {error.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cooper"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  error.lastName
                    ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#FF5C35] focus:ring-[#FF5C35]/15"
                }`}
              />
              {error.lastName && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1.5">
                  {error.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Corporate Email Address
            </label>
            <input
              type="email"
              placeholder="bessie.cooper@workpay.io"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                error.email
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#FF5C35] focus:ring-[#FF5C35]/15"
              }`}
            />
            {error.email && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1.5">
                {error.email}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigator("/employees")}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={saveOrUpdateEmployee}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#FF5C35] hover:bg-[#e84f28] rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {id ? "Save Changes" : "Create Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeComponent;
