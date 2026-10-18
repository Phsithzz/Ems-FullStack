package net.javaguides.ems.controllers;

import lombok.AllArgsConstructor;
import net.javaguides.ems.dto.EmployeeDto;
import net.javaguides.ems.services.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
