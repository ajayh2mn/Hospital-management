package com.hospital.hms.dto.request;

import com.hospital.hms.entity.TicketCategory;
import com.hospital.hms.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportTicketRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;
}
