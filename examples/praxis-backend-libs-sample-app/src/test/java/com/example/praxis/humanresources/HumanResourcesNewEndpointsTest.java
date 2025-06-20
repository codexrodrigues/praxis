package com.example.praxis.humanresources;

import com.example.praxis.common.config.ApiRouteDefinitions;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class HumanResourcesNewEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testFolhasPagamentoEndpoint() throws Exception {
        mockMvc.perform(get(ApiRouteDefinitions.HR_FOLHAS_PAGAMENTO_PATH))
                .andExpect(status().isOk());
    }

    @Test
    public void testEventosFolhaEndpoint() throws Exception {
        mockMvc.perform(get(ApiRouteDefinitions.HR_EVENTOS_FOLHA_PATH))
                .andExpect(status().isOk());
    }

    @Test
    public void testFeriasAfastamentosEndpoint() throws Exception {
        mockMvc.perform(get(ApiRouteDefinitions.HR_FERIAS_AFASTAMENTOS_PATH))
                .andExpect(status().isOk());
    }
}

