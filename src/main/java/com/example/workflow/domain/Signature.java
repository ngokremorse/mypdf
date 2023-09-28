package com.example.workflow.domain;

import java.io.Serializable;

public class Signature implements Serializable {

    public Signature() {

    }

    public Signature(float left, float top, float with, float height, Metadata metadata, float scale) {
        this.left = left;
        this.top = top;
        this.with = with;
        this.height = height;
        this.metadata = metadata;
        this.scale = scale;
    }

    private float left;
    private float top;
    private float with;
    private float height;
    private Metadata metadata;
    private float scale;

    public static class Metadata implements Serializable {
        private int pageActive;
        private String id;
        private String name;
        private boolean editable;

        public Metadata() {

        }

        public Metadata(int pageActive, String id, String name, boolean editable) {
            this.pageActive = pageActive;
            this.id = id;
            this.name = name;
            this.editable = editable;
        }

        public int getPageActive() {
            return pageActive;
        }

        public void setPageActive(int pageActive) {
            this.pageActive = pageActive;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isEditable() {
            return editable;
        }

        public void setEditable(boolean editable) {
            this.editable = editable;
        }
    }

    public float getLeft() {
        return left;
    }

    public void setLeft(float left) {
        this.left = left;
    }

    public float getTop() {
        return top;
    }

    public void setTop(float top) {
        this.top = top;
    }

    public float getWith() {
        return with;
    }

    public void setWith(float with) {
        this.with = with;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    public float getScale() {
        return scale;
    }

    public void setScale(float scale) {
        this.scale = scale;
    }
}

