import React from 'react'

const ListEmployeeComponent = () => {

    const dummyData = [
        {
            "id":1,
            "firstName":"Phoo",
            "lastName":"Sith",
            "email":"test@gmail.com"
        },
       {
            "id":2,
            "firstName":"Phoo",
            "lastName":"Sith",
            "email":"555test@gmail.com"
        },
             {
            "id":3,
            "firstName":"Phoo",
            "lastName":"Sith",
            "email":"12345test@gmail.com"
        },
             {
            "id":4,
            "firstName":"Phoo",
            "lastName":"Sith",
            "email":"test123@gmail.com"
        },
             {
            "id":5,
            "firstName":"Phoo",
            "lastName":"Sith",
            "email":"123test@gmail.com"
        },
        
    ]

  return (
    <div className='container'>
        <h2 className='text-center'>List of Employees</h2>
        <table className='table table-striped table-border'>
            <thead>
                <tr>
                    <th>Employee Id</th>
                    <th>Employee FirstName</th>
                    <th>Employee LastName</th>
                    <th>Employee Email</th>
                </tr>
            </thead>
            <tbody>
                {
                    dummyData.map(employee =>
                        <tr key={employee.id}>
                            <td>{employee.id}</td>
                            <td>{employee.firstName}</td>
                            <td>{employee.LastName}</td>
                            <td>{employee.email}</td>
                        </tr>
                    )
                }
                <tr></tr>
            </tbody>
            

        </table>
    </div>
  )
}

export default ListEmployeeComponent