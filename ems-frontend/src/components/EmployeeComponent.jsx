import React, { useState } from "react";
import { createEmployee } from "../services/EmployeeService";
import { useNavigate } from "react-router-dom";

const EmployeeComponent = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const navigator = useNavigate();

  const [error,setError] = useState({
    firstName:'',
    lastName:'',
    email:'',
  })

  const saveEmployee = async (e) => {
    e.preventDefault();

    if(validateForm){

      const employee = { firstName, lastName, email };
      console.log(employee);
  
      try {
        const response = await createEmployee(employee);
        console.log(response.data);
        navigator("/employees");
      } catch (error) {
        console.error("Error creating employee:", error);
      }
    }
  };

  function validateForm(){
    let valid = true

    const errorCopy = {... error}

    if(firstName.trim()){
      errorCopy.firstName = ''
    }
    else{
      errorCopy.firstName = 'Firstname is required'
      valid = false
    }

    if(lastName.trim()){
      errorCopy.lastName = ''
    }
    else{
      errorCopy.lastName = 'Lastname is required'
      valid = false
    }

    if(email.trim()){
      errorCopy.email = ''
    }
    else{
      errorCopy.email = 'Email is required'
      valid = false

    }
  }


  return (
    <div className="container">
      <br />
      <br />
      <div className="row">
        <div className="card col-md-6 offset-md-3">
          <h2 className="text-center">Add Employee</h2>
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
                  className={}
                />
                
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Last Name:</label>
                <input
                  type="text"
                  placeholder="Enter Employee Last Name"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group mb-2">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  placeholder="Enter Employee Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>

              <button className="btn btn-success" onClick={saveEmployee}>
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
