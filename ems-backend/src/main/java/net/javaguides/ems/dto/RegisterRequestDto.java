package net.javaguides.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDto {
    private String name;
    private String email;
    private String password;
    private String role; // optional, defaults to ROLE_ADMIN or ROLE_EMPLOYEE

    public RegisterRequestDto() {
    }

    public RegisterRequestDto(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
