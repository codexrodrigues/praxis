package com.example.praxis.sample.dto;


import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.annotation.UISchema;

import java.time.LocalDate;

public class UserDTO {

    @UISchema
    private String fullName;

    @UISchema
    private LocalDate birthDate;

    @UISchema
    private String email;

    @UISchema
    private boolean active;

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
