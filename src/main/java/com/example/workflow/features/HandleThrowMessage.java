package com.example.workflow.features;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.model.bpmn.instance.MessageEventDefinition;
import org.camunda.bpm.model.bpmn.instance.ThrowEvent;
import org.springframework.stereotype.Component;

@Component
public class HandleThrowMessage implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String processInstanceId = execution.getProcessInstanceId();
        ThrowEvent messageEvent = (ThrowEvent) execution.getBpmnModelElementInstance();
        MessageEventDefinition messageEventDefinition = (MessageEventDefinition) messageEvent
                .getEventDefinitions().iterator().next();
        String receivingMessageName = messageEventDefinition.getMessage().getName();

        // Single send, recommend using this way!
        execution.getProcessEngineServices()
                .getRuntimeService()
                .createMessageCorrelation(receivingMessageName)
                .processInstanceId(processInstanceId)
                .correlate();


        // Multi send, no recommend using this way!
//        String[] messages = receivingMessageName.split(",");
//        Arrays.stream(messages).forEach(msg -> {
//            execution.getProcessEngineServices()
//                    .getRuntimeService()
//                    .createMessageCorrelation(msg.trim())
//                    .processInstanceId(processInstanceId)
//                    .correlate();
//        });

    }
}
