package net.javaguides.ems.controllers;

import lombok.AllArgsConstructor;
import net.javaguides.ems.dto.EmployeeDto;
import net.javaguides.ems.services.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private EmployeeService employeeService;

    //build add employee rest api
    @PostMapping
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto employeeDto){

        EmployeeDto saveEmployee = employeeService.createEmployee(employeeDto);

        return new ResponseEntity<>(saveEmployee, HttpStatus.CREATED);
    }

    //build get one employee rest api
    @GetMapping("{id}")
    public ResponseEntity<EmployeeDto> getEmploeeById(@PathVariable("id") Long employeeId){
        EmployeeDto employeeDto = employeeService.getEmployeeId(employeeId);

        return ResponseEntity.ok(employeeDto);
    }

    //build get all employee
    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getAllEmployee(){
        List<EmployeeDto> employees = employeeService.getAllEmployee();

        return ResponseEntity.ok(employees);
    }

    //build update employee
    @PutMapping("{id}")
    public  ResponseEntity<EmployeeDto> updateEmployee(
            @PathVariable("id") Long employeeId,
            @RequestBody EmployeeDto updatedEmployee){
        EmployeeDto employeeDto = employeeService.updateEmployee(employeeId,updatedEmployee);

        return ResponseEntity.ok(employeeDto);
    }

    //build delete employee
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable("id") Long employeeId
    ){
        employeeService.deleteEmployee(employeeId);

        return ResponseEntity.ok("Employee deleted successfully!!!");
    }
}
