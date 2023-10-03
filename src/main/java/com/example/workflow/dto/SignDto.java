package com.example.workflow.dto;

import com.example.workflow.domain.Component;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SignDto {

    private List<Component> signatures;
    private List<Component> textInputs;
    private float scalePage;
}
