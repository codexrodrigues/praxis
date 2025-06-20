package com.example.praxis.humanresources.dto;

import org.junit.Test;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.annotation.Filterable.FilterOperation;

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.Assert.*;

public class DtoAnnotationTest {

    @Test
    public void testSimpleDtosHaveGettersAndUiSchema() {
        List<Class<?>> dtos = Arrays.asList(
                CargoDTO.class,
                DepartamentoDTO.class,
                DependenteDTO.class,
                EnderecoDTO.class,
                EventoFolhaDTO.class,
                FeriasAfastamentoDTO.class,
                FolhaPagamentoDTO.class,
                FuncionarioDTO.class
        );

        for (Class<?> dto : dtos) {
            for (Field field : dto.getDeclaredFields()) {
                assertTrue(dto.getSimpleName() + "." + field.getName() + " should have @UISchema",
                        field.isAnnotationPresent(UISchema.class));
                assertGetterExists(dto, field);
            }
        }
    }

    @Test
    public void testCargoFilterDtoAnnotations() {
        Map<String, Expectation> expected = new HashMap<>();
        expected.put("nome", new Expectation(FilterOperation.LIKE, ""));
        expected.put("nivel", new Expectation(FilterOperation.LIKE, ""));
        expected.put("descricao", new Expectation(FilterOperation.LIKE, ""));
        expected.put("salario", new Expectation(FilterOperation.BETWEEN, ""));
        validateFilterDto(CargoFilterDTO.class, expected);
    }

    @Test
    public void testDepartamentoFilterDtoAnnotations() {
        Map<String, Expectation> expected = new HashMap<>();
        expected.put("nome", new Expectation(FilterOperation.LIKE, ""));
        expected.put("codigo", new Expectation(FilterOperation.LIKE, ""));
        expected.put("responsavelId", new Expectation(FilterOperation.EQUAL, "responsavel.id"));
        validateFilterDto(DepartamentoFilterDTO.class, expected);
    }

    @Test
    public void testFuncionarioFilterDtoAnnotations() {
        Map<String, Expectation> expected = new LinkedHashMap<>();
        expected.put("nomeCompleto", new Expectation(FilterOperation.LIKE, ""));
        expected.put("cpf", new Expectation(FilterOperation.EQUAL, ""));
        expected.put("cargoId", new Expectation(FilterOperation.EQUAL, "cargo.id"));
        expected.put("departamentoId", new Expectation(FilterOperation.EQUAL, "departamento.id"));
        expected.put("email", new Expectation(FilterOperation.LIKE, ""));
        expected.put("telefone", new Expectation(FilterOperation.LIKE, ""));
        expected.put("dataNascimento", new Expectation(FilterOperation.BETWEEN, ""));
        expected.put("salario", new Expectation(FilterOperation.BETWEEN, ""));
        expected.put("dataAdmissao", new Expectation(FilterOperation.BETWEEN, ""));
        expected.put("logradouro", new Expectation(FilterOperation.LIKE, "endereco.logradouro"));
        expected.put("numero", new Expectation(FilterOperation.LIKE, "endereco.numero"));
        expected.put("complemento", new Expectation(FilterOperation.LIKE, "endereco.complemento"));
        expected.put("bairro", new Expectation(FilterOperation.LIKE, "endereco.bairro"));
        expected.put("cidade", new Expectation(FilterOperation.LIKE, "endereco.cidade"));
        expected.put("estado", new Expectation(FilterOperation.LIKE, "endereco.estado"));
        expected.put("cep", new Expectation(FilterOperation.LIKE, "endereco.cep"));
        expected.put("ativo", new Expectation(FilterOperation.EQUAL, ""));
        validateFilterDto(FuncionarioFilterDTO.class, expected);
    }

    @Test
    public void testFolhaPagamentoFilterDtoAnnotations() {
        Map<String, Expectation> expected = new LinkedHashMap<>();
        expected.put("funcionarioId", new Expectation(FilterOperation.EQUAL, "funcionario.id"));
        expected.put("ano", new Expectation(FilterOperation.EQUAL, ""));
        expected.put("mes", new Expectation(FilterOperation.EQUAL, ""));
        expected.put("salarioBruto", new Expectation(FilterOperation.BETWEEN, ""));
        expected.put("dataPagamento", new Expectation(FilterOperation.BETWEEN, ""));
        validateFilterDto(FolhaPagamentoFilterDTO.class, expected);
    }

    @Test
    public void testEventoFolhaFilterDtoAnnotations() {
        Map<String, Expectation> expected = new LinkedHashMap<>();
        expected.put("folhaPagamentoId", new Expectation(FilterOperation.EQUAL, "folhaPagamento.id"));
        expected.put("descricao", new Expectation(FilterOperation.LIKE, ""));
        expected.put("tipo", new Expectation(FilterOperation.LIKE, ""));
        expected.put("valor", new Expectation(FilterOperation.BETWEEN, ""));
        validateFilterDto(EventoFolhaFilterDTO.class, expected);
    }

    @Test
    public void testFeriasAfastamentoFilterDtoAnnotations() {
        Map<String, Expectation> expected = new LinkedHashMap<>();
        expected.put("funcionarioId", new Expectation(FilterOperation.EQUAL, "funcionario.id"));
        expected.put("tipo", new Expectation(FilterOperation.LIKE, ""));
        expected.put("dataInicio", new Expectation(FilterOperation.BETWEEN, ""));
        expected.put("dataFim", new Expectation(FilterOperation.BETWEEN, ""));
        validateFilterDto(FeriasAfastamentoFilterDTO.class, expected);
    }

    private void validateFilterDto(Class<?> clazz, Map<String, Expectation> expectations) {
        for (Field field : clazz.getDeclaredFields()) {
            assertTrue(clazz.getSimpleName() + "." + field.getName() + " should have @UISchema",
                    field.isAnnotationPresent(UISchema.class));
            assertTrue(clazz.getSimpleName() + "." + field.getName() + " should have @Filterable",
                    field.isAnnotationPresent(Filterable.class));
            Filterable annotation = field.getAnnotation(Filterable.class);
            Expectation exp = expectations.get(field.getName());
            assertNotNull("Unexpected field " + field.getName(), exp);
            assertEquals(exp.operation, annotation.operation());
            assertEquals(exp.relation, annotation.relation());
            assertGetterExists(clazz, field);
        }
    }

    private void assertGetterExists(Class<?> clazz, Field field) {
        String name = field.getName();
        String capital = Character.toUpperCase(name.charAt(0)) + name.substring(1);
        List<String> methods = new ArrayList<>();
        methods.add("get" + capital);
        if (field.getType() == boolean.class) {
            methods.add("is" + capital);
        }

        boolean found = false;
        for (String m : methods) {
            try {
                clazz.getDeclaredMethod(m);
                found = true;
                break;
            } catch (NoSuchMethodException ignored) {
            }
        }
        assertTrue("Getter not found for field " + name + " in " + clazz.getSimpleName(), found);
    }

    private static class Expectation {
        final FilterOperation operation;
        final String relation;

        Expectation(FilterOperation operation, String relation) {
            this.operation = operation;
            this.relation = relation;
        }
    }
}
