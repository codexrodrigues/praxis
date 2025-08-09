package com.example.praxis.uischema;

import com.example.praxis.common.config.ApiRouteDefinitions;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UiSchemaTestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void redirectIncludesDocumentParam() throws Exception {
        mockMvc
                .perform(get(ApiRouteDefinitions.UI_WRAPPERS_TEST_PATH + "/schemas"))
                .andExpect(status().isFound())
                .andExpect(
                        header().string(
                                "Location",
                                containsString(
                                        "document=" + ApiRouteDefinitions.UI_WRAPPERS_TEST_GROUP)));
    }
}

