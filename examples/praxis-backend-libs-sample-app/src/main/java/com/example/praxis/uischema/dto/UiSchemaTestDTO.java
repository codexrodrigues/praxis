package com.example.praxis.uischema.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import com.example.praxis.common.config.ApiRouteDefinitions;
import org.praxisplatform.uischema.FieldControlType;
import org.praxisplatform.uischema.FieldDataType;
import org.praxisplatform.uischema.NumericFormat;
import org.praxisplatform.uischema.ValidationPattern;
import org.praxisplatform.uischema.AllowedFileTypes;
import org.praxisplatform.uischema.IconPosition;
import org.praxisplatform.uischema.extension.annotation.UISchema;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO usado para testes de renderização dos wrappers de UI.
 * Contém campos anotados com uma ampla variedade de opções de {@link UISchema}.
 */
public class UiSchemaTestDTO {

    @UISchema(
            description = "Simple text field",
            example = "John Doe",
            name = "textField",
            label = "Text Field",
            placeholder = "Type text",
            defaultValue = "Default Text",
            group = "basic",
            order = 1,
            width = "50%",
            isFlex = true,
            displayOrientation = "row",
            icon = "edit",
            iconPosition = IconPosition.LEFT,
            iconSize = "sm",
            iconColor = "#0000ff",
            iconClass = "fa fa-edit",
            iconStyle = "margin-right:4px;",
            iconFontSize = "14px",
            helpText = "This is a help text",
            hint = "Hint example",
            tooltipOnHover = "Tooltip example"
    )
    private String textField;

    @UISchema(
            label = "Number",
            type = FieldDataType.NUMBER,
            controlType = FieldControlType.NUMERIC_TEXT_BOX,
            group = "basic",
            order = 2,
            numericFormat = NumericFormat.DECIMAL,
            numericStep = "0.5",
            numericMin = "0",
            numericMax = "100",
            numericMaxLength = "5",
            defaultValue = "10",
            required = true,
            min = "0",
            max = "100",
            viewOnlyStyle = "color: gray;",
            debounceTime = 300,
            rangeMessage = "Value must be between 0 and 100",
            customValidator = "validateRange"
    )
    private Double numberField;

    @UISchema(
            label = "Date",
            type = FieldDataType.DATE,
            controlType = FieldControlType.DATE_PICKER,
            order = 3,
            group = "basic",
            placeholder = "yyyy-MM-dd",
            validationMode = "blur",
            validationTriggers = "change",
            required = true
    )
    private LocalDate dateField;

    @UISchema(
            label = "Password",
            type = FieldDataType.PASSWORD,
            controlType = FieldControlType.PASSWORD,
            order = 4,
            required = true,
            pattern = ValidationPattern.PASSWORD_MEDIUM,
            patternMessage = "Password should be stronger",
            hiddenCondition = "false"
    )
    private String password;

    @UISchema(
            label = "Email",
            type = FieldDataType.EMAIL,
            controlType = FieldControlType.EMAIL_INPUT,
            order = 5,
            required = true,
            pattern = ValidationPattern.EMAIL,
            conditionalRequired = "active",
            requiredMessage = "Email is required",
            unique = true,
            asyncValidator = "verifyEmailAsync"
    )
    private String email;

    @UISchema(
            label = "Website",
            type = FieldDataType.URL,
            controlType = FieldControlType.URL_INPUT,
            order = 6,
            defaultValue = "https://example.com",
            filterable = true
    )
    private String website;

    @UISchema(
            label = "Description",
            controlType = FieldControlType.TEXTAREA,
            order = 7,
            group = "advanced",
            maxLength = 500,
            minLength = 10,
            required = true,
            validationMode = "submit",
            minLengthMessage = "Description too short",
            maxLengthMessage = "Description too long",
            minWords = 2
    )
    private String description;

    @UISchema(
            label = "Status",
            controlType = FieldControlType.SELECT,
            options = "[{\"label\":\"Active\",\"value\":\"ACTIVE\"},{\"label\":\"Inactive\",\"value\":\"INACTIVE\"}]",
            emptyOptionText = "Select status",
            order = 8,
            group = "selection",
            valueField = "value",
            displayField = "label"
    )
    private String status;

    @UISchema(
            label = "Roles",
            controlType = FieldControlType.MULTI_SELECT,
            options = "[{\"label\":\"Admin\",\"value\":\"ADMIN\"},{\"label\":\"User\",\"value\":\"USER\"}]",
            multiple = true,
            order = 9,
            group = "selection",
            dependentField = "status",
            conditionalDisplay = "status == 'ACTIVE'",
            resetOnDependentChange = true
    )
    private List<String> roles;

    @UISchema(
            label = "Active",
            controlType = FieldControlType.CHECKBOX,
            order = 10,
            defaultValue = "true",
            inlineEditing = true,
            sortable = false,
            filterable = true
    )
    private Boolean active;

    @UISchema(
            label = "Agreement",
            controlType = FieldControlType.RADIO_GROUP,
            options = "[{\"label\":\"Yes\",\"value\":\"yes\"},{\"label\":\"No\",\"value\":\"no\"}]",
            order = 11,
            group = "selection",
            tooltipOnHover = "Choose yes or no"
    )
    private String agreement;

    @UISchema(
        label = "Profile Picture",
        type = FieldDataType.FILE,
        controlType = FieldControlType.FILE_UPLOAD,
        order = 12,
        allowedFileTypes = AllowedFileTypes.IMAGES,
        maxFileSize = "5MB"
    )
    private String profilePicture;

    @UISchema(
            label = "Price Range",
            type = FieldDataType.NUMBER,
            controlType = FieldControlType.RANGE_SLIDER,
            order = 13,
            group = "advanced",
            numericMin = "0",
            numericMax = "1000",
            numericStep = "50",
            defaultValue = "500"
    )
    private Double priceRange;

    @UISchema(
            label = "Vacation Period",
            type = FieldDataType.DATE,
            controlType = FieldControlType.DATE_RANGE,
            order = 14,
            group = "advanced"
    )
    private List<LocalDate> vacationPeriod;

    @UISchema(
        label = "Departments",
        controlType = FieldControlType.MULTI_SELECT_TREE,
        options = "[{\"label\":\"Operations\",\"value\":\"ops\",\"children\":[{\"label\":\"HR\",\"value\":\"hr\"},{\"label\":\"IT\",\"value\":\"it\"}]},{\"label\":\"Sales\",\"value\":\"sales\"}]",
        order = 15,
        group = "selection",
        displayField = "label",
        valueField = "value"
    )
    private List<String> departments;

    @UISchema(
            label = "Department",
            controlType = FieldControlType.AUTO_COMPLETE,
            endpoint = ApiRouteDefinitions.HR_DEPARTAMENTOS_PATH,
            order = 16,
            group = "selection",
            displayField = "nome",
            valueField = "id"
    )
    private Long departmentId;

    @UISchema(
            label = "Favorite Color",
            controlType = FieldControlType.COLOR_PICKER,
            order = 17,
            group = "basic",
            defaultValue = "#ff0000",
            extraProperties = {
                    @ExtensionProperty(name = "x-color-theme", value = "corporate")
            }
    )
    private String favoriteColor;

    @UISchema(
            label = "Salary",
            type = FieldDataType.NUMBER,
            controlType = FieldControlType.CURRENCY_INPUT,
            order = 18,
            group = "advanced",
            numericFormat = NumericFormat.DECIMAL,
            numericStep = "0.01",
            numericMin = "0"
    )
    private Double salary;

    @UISchema(
            label = "Phone Number",
            controlType = FieldControlType.INPUT,
            order = 19,
            mask = "(99) 99999-9999",
            pattern = ValidationPattern.PHONE,
            patternMessage = "Invalid phone number",
            transformValueFunction = "normalizePhone"
    )
    private String phoneNumber;

    @UISchema(
            label = "Employee Code",
            order = 20,
            defaultValue = "AUTO",
            group = "basic",
            disabled = true,
            readOnly = true,
            editable = false,
            unique = true,
            tableHidden = true
    )
    private String employeeCode;

    @UISchema(
            label = "Internal Notes",
            controlType = FieldControlType.TEXTAREA,
            order = 21,
            group = "advanced",
            hidden = true,
            formHidden = true
    )
    private String internalNotes;

    @UISchema(
            label = "Job Position",
            controlType = FieldControlType.SELECT,
            endpoint = ApiRouteDefinitions.HR_CARGOS_PATH,
            order = 22,
            group = "selection",
            filter = "contains",
            filterOptions = "[{\"label\":\"Starts With\",\"value\":\"startsWith\"}]",
            filterControlType = "input",
            displayField = "nome",
            valueField = "id"
    )
    private Long jobPositionId;

    @UISchema(
            label = "Tags",
            controlType = FieldControlType.MULTI_SELECT,
            options = "[\"alpha\",\"beta\"]",
            order = 23,
            group = "selection"
    )
    private List<String> tags;

    // Getters and setters

    public String getTextField() {
        return textField;
    }

    public void setTextField(String textField) {
        this.textField = textField;
    }

    public Double getNumberField() {
        return numberField;
    }

    public void setNumberField(Double numberField) {
        this.numberField = numberField;
    }

    public LocalDate getDateField() {
        return dateField;
    }

    public void setDateField(LocalDate dateField) {
        this.dateField = dateField;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getAgreement() {
        return agreement;
    }

    public void setAgreement(String agreement) {
        this.agreement = agreement;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public Double getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(Double priceRange) {
        this.priceRange = priceRange;
    }

    public List<LocalDate> getVacationPeriod() {
        return vacationPeriod;
    }

    public void setVacationPeriod(List<LocalDate> vacationPeriod) {
        this.vacationPeriod = vacationPeriod;
    }

    public List<String> getDepartments() {
        return departments;
    }

    public void setDepartments(List<String> departments) {
        this.departments = departments;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getFavoriteColor() {
        return favoriteColor;
    }

    public void setFavoriteColor(String favoriteColor) {
        this.favoriteColor = favoriteColor;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }

    public Long getJobPositionId() {
        return jobPositionId;
    }

    public void setJobPositionId(Long jobPositionId) {
        this.jobPositionId = jobPositionId;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}

