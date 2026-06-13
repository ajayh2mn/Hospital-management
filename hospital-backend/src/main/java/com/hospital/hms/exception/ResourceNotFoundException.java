package com.hospital.hms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a requested resource doesn't exist in the database.
 * Example: GET /api/patients/999 when patient 999 doesn't exist.
 *
 * @ResponseStatus(NOT_FOUND): Spring automatically returns HTTP 404.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Convenience constructor: "Staff not found with id: 5"
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
