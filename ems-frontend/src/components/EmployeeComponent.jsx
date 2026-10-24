import React, { useState } from "react";
import { addEmployee } from "../services/EmployeeService";

const EmployeeComponent = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleFirstName = (e)=> setFirstName(e.target.value);
  
  function handleEmail(e) {
    setEmail(e.target.value);
  }

  function saveEmployee(e){
    e.preventDefault();

      const employee = {firstName,lastName,email}
    addEmployee(employee)
  
  }

  return (
    <div className="container">
      <br />
      <br />
      <div className="row">
        <div className="card col-md-6 offset-md-3 offset-md-3">
          <h2 className="text-center">Add Employee</h2>
          <div className="card-body">
            <form action="">
              <div className="form-group mb-2">
                <label htmlFor="" className="form-label">
                  First Name:
                </label>
                <input
                  type="text"
                  placeholder="Enter Employee First Name"
                  name="firstName"
                  value={firstName}
                  onChange={handleFirstName}
                  className="form-control"
                />
              </div>
                          <div className="form-group mb-2">
                <label htmlFor="" className="form-label">
                  Last Name:
                </label>
                <input
                  type="text"
                  placeholder="Enter Employee Last Name"
                  name="lastName"
                  value={lastName}
                  onChange={(e)=>setLastName(e.target.value)}
                  className="form-control"
                />
              </div>
                          <div className="form-group mb-2">
                <label htmlFor="" className="form-label">
                  Email:
                </label>
                <input
                  type="email"
                  placeholder="Enter Employee Email"
                  name="email"
                  value={email}
                  onChange={handleEmail}
                  className="form-control"
                />
              </div>

              <button className="btn btn-success"
              onClick={saveEmployee}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeComponent;
