# Ems-FullStack (Employee Management System)

A Full-Stack Employee Management System built with Spring Boot and designed to connect with a frontend client.

## Project Structure

```text
Ems-FullStack/
├── ems-backend/     # Spring Boot Backend API
└── ems-frontend/    # Frontend Client (Upcoming)
```

## Backend Tech Stack

- **Java:** 17
- **Framework:** Spring Boot
- **Persistence:** Spring Data JPA / Hibernate
- **Database:** MySQL
- **Tooling & Build:** Maven, Lombok

## Current Features & Setup

- Configured MySQL database connection (`ems` database)
- Set up layered project architecture:
  - `controllers`: REST APIs
  - `services`: Business logic
  - `repository`: Data access layer
  - `dto`: Data transfer objects
  - `entity`: JPA entities
  - `exception`: Custom exceptions & error handling
- Created `Employee` entity with attributes:
  - `id` (Auto-generated Primary Key)
  - `firstName`
  - `lastName`
  - `email` (Unique & Not Null)

## Getting Started (Backend)

1. Navigate to the backend directory:
   ```bash
   cd ems-backend
   ```
2. Copy the example configuration to create your local `application.properties`:
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```
3. Update `src/main/resources/application.properties` with your MySQL database username and password.
4. Run the backend application:
   ```bash
   ./mvnw spring-boot:run
   ```

