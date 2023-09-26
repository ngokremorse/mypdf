package com.example.workflow.features;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component
public class HandleError implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        throw new Exception("Have error");
    }
}