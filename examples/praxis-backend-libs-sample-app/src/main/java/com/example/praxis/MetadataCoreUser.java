package com.example.praxis;

import org.praxisplatform.metadata.core.annotations.PraxisEntity;

public class MetadataCoreUser {

    public static void main(String[] args) {
        // Simple usage to ensure the class from the dependency can be resolved.
        System.out.println("Successfully accessed PraxisEntity annotation: " + PraxisEntity.class.getSimpleName());
    }
}
