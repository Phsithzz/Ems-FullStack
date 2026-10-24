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
    <div className="container">
      <br />
      <br />
      <div className="row">
        <div className="card col-md-6 offset-md-3">
          <h2 className="text-center">{id ? "Update Employee" : "Add Employee"}</h2>
          <div className="card-body">
            <form>
              <div className="form-group mb-2">
                <label className="form-label">First Name:</label>
                <input
                  type="text"
                  placeholder="Enter Employee First Name"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`form-control ${error.firstName ? "is-invalid" : ""}`}
                />
                {error.firstName && (
                  <div className="invalid-feedback">{error.firstName}</div>
                )}
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Last Name:</label>
                <input
                  type="text"
                  placeholder="Enter Employee Last Name"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`form-control ${error.lastName ? "is-invalid" : ""}`}
                />
                {error.lastName && (
                  <div className="invalid-feedback">{error.lastName}</div>
                )}
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  placeholder="Enter Employee Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-control ${error.email ? "is-invalid" : ""}`}
                />
                {error.email && (
                  <div className="invalid-feedback">{error.email}</div>
                )}
              </div>

              <button className="btn btn-success" onClick={saveOrUpdateEmployee}>
                {id ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeComponent;
