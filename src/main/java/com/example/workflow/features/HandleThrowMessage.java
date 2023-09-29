package com.example.workflow.features;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.model.bpmn.instance.MessageEventDefinition;
import org.camunda.bpm.model.bpmn.instance.ThrowEvent;

import java.util.Arrays;

public class HandleThrowMessage implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        ThrowEvent messageEvent = (ThrowEvent) execution.getBpmnModelElementInstance();
        MessageEventDefinition messageEventDefinition = (MessageEventDefinition) messageEvent
                .getEventDefinitions().iterator().next();
//        String receivingMessageName = "Message_0tgj2qm,Message_27hrjfd,Message_196ctqv";
        String receivingMessageName = messageEventDefinition.getMessage().getName();

        // Single send, recommend using this way!
        execution.getProcessEngineServices()
                .getRuntimeService()
                .createMessageCorrelation(receivingMessageName)
//                    .processInstanceId("c69348c8-5e80-11ee-89e9-00090ffe0001")
                .correlate();


        // Multi send, no recommend using this way!
        String[] messages = receivingMessageName.split(",");
        Arrays.stream(messages).forEach(msg -> {
            execution.getProcessEngineServices()
                    .getRuntimeService()
                    .createMessageCorrelation(msg.trim())
//                    .processInstanceId("c69348c8-5e80-11ee-89e9-00090ffe0001")
                    .correlate();
        });

    }
}
