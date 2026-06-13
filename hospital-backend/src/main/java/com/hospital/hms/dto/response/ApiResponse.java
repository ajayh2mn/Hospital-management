package com.hospital.hms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ApiResponse — a standard wrapper for ALL API responses.
 *
 * Why use a standard wrapper?
 * Instead of returning raw data, we always return:
 * {
 *   "success": true,
 *   "message": "Staff created successfully",
 *   "data": { ... actual data ... },
 *   "timestamp": "2024-01-01T10:00:00"
 * }
 *
 * This makes the frontend predictable — it always knows where to find data and status.
 *
 * @JsonInclude(NON_NULL): Don't include null fields in the JSON response
 * (e.g., if there's no error, don't send "error": null)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String error;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Factory methods for convenience
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(message)
                .build();
    }
}
