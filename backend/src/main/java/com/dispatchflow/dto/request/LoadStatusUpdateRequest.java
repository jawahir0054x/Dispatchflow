package com.dispatchflow.dto.request;

import com.dispatchflow.enums.LoadStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private LoadStatus status;
}
