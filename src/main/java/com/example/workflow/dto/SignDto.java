package com.example.workflow.dto;

import com.example.workflow.domain.Signature;

import java.util.List;

public class SignDto {

    private List<Signature> signatures;
    private float scale;


    public SignDto(List<Signature> signatures, float scale) {
        this.signatures = signatures;
        this.scale = scale;
    }

    public SignDto(){

    }

    public List<Signature> getSignatures() {
        return signatures;
    }

    public void setSignatures(List<Signature> signatures) {
        this.signatures = signatures;
    }

    public float getScale() {
        return scale;
    }

    public void setScale(float scale) {
        this.scale = scale;
    }
}
