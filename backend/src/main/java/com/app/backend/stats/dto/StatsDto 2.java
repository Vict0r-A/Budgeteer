package com.app.backend.stats.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record StatsDto(
        @JsonProperty("by_category") ByGroup by_category,
        @JsonProperty("by_day") ByGroup by_day
) {
    public record ByGroup(
            List<String> labels,
            List<BigDecimal> values
    ) {
    }
}
