package com.example.workflow.features;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class HandleUsers implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        execution.setVariable("users", Arrays.asList("thanhtq", "thanhtq1"));
    }
}