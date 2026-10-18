package net.javaguides.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    public EmployeeDto() {
    }

    public EmployeeDto(Long id, String firstName, String lastName, String email) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
}
