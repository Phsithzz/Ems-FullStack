import React, { useEffect, useState } from "react";
import { createEmployee, getEmployee, updateEmployee } from "../services/EmployeeService";
import { useNavigate, useParams } from "react-router-dom";

const EmployeeComponent = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const { id } = useParams();
  const navigator = useNavigate();

  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const response = await getEmployee(id);
          setFirstName(response.data.firstName);
          setLastName(response.data.lastName);
          setEmail(response.data.email);
        } catch (err) {
          console.error("Error fetching employee:", err);
        }
      };

      fetchEmployee();
    }
  }, [id]);

  const saveOrUpdateEmployee = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const employee = { firstName, lastName, email };

      try {
        if (id) {
          await updateEmployee(id, employee);
        } else {
          await createEmployee(employee);
        }
        navigator("/employees");
      } catch (err) {
        console.error("Error saving employee:", err);
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
    <div className="max-w-xl mx-auto py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            {id ? "Update Employee" : "Add Employee"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {id
              ? "Edit existing employee information in the system."
              : "Fill in the details below to register a new employee."}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <form className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter First Name"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                  error.firstName
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              {error.firstName && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">
                  {error.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter Last Name"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                  error.lastName
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              {error.lastName && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">
                  {error.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                  error.email
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              {error.email && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">
                  {error.email}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigator("/employees")}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={saveOrUpdateEmployee}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                {id ? "Update Employee" : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeComponent;
