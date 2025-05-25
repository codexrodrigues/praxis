package com.example.praxis.sample.dto;

import org.praxisplatform.meta.ui.ExtensionProperty;
import org.praxisplatform.meta.ui.UIExtension;
import org.praxisplatform.meta.ui.UISchema;
import org.praxisplatform.meta.ui.std.UIDataExtension;
import org.praxisplatform.meta.ui.std.UINomeProprioExtension;

import java.time.LocalDate;

public class UserDTO {

    @UISchema
    @UINomeProprioExtension
    private String fullName;

    @UISchema
    @UIDataExtension
    private LocalDate birthDate;

    @UISchema
    @UIExtension(properties = {
        @ExtensionProperty(name = "x-ui-controlType", value = "email")
    })
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
