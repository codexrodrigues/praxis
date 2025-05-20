package org.praxisplatform.meta.ui.model.property;
/**
 * Interface que define os tipos de controle (`CONTROL_TYPE`) disponíveis para a apresentação dos campos de formulário.
 *
 * O `CONTROL_TYPE` especifica o tipo de elemento de UI (User Interface) que será usado para capturar ou exibir dados do campo.
 * Essa configuração permite que a camada de apresentação saiba como renderizar o campo e oferecer a interação adequada ao usuário.
 *
 * Em casos onde o `CONTROL_TYPE` não é especificado, a camada de apresentação pode usar o valor de `TYPE` (definido em `FieldDataType`)
 * para decidir o controle mais adequado de forma automática.
 */
public interface FieldControlType {

    /**
     * Controle de entrada de texto simples.
     *
     * Exemplo de uso: Captura de informações textuais como nome, sobrenome ou endereço.
     * Na camada de apresentação, pode ser exibido como um campo de input `<input type="text">`.
     */
    String INPUT = "input";

    /**
     * Controle para seleção de uma opção a partir de uma lista de opções predefinidas.
     *
     * Exemplo de uso: Campos como "País" ou "Categoria", onde o usuário deve escolher entre várias opções.
     * Na camada de apresentação, pode ser exibido como um dropdown ou combo box.
     */
    String SELECT = "select";

    /**
     * Controle para valores booleanos, exibindo uma caixa de seleção.
     *
     * Exemplo de uso: Campos como "Aceito os Termos" ou "Ativo", onde o usuário marca ou desmarca uma opção.
     * Na camada de apresentação, pode ser exibido como um `<input type="checkbox">`.
     */
    String CHECKBOX = "checkbox";

    /**
     * Controle para escolher uma única opção entre várias opções mutuamente exclusivas.
     *
     * Exemplo de uso: Campos como "Gênero" (masculino, feminino) ou "Método de Pagamento" (cartão, boleto).
     * Na camada de apresentação, pode ser exibido como um grupo de botões de rádio (`<input type="radio">`).
     */
    String RADIO = "radio";

    /**
     * Controle para valores numéricos que permite ao usuário selecionar um valor dentro de um intervalo.
     *
     * Exemplo de uso: Campos como "Classificação" ou "Idade", onde o usuário ajusta um controle deslizante para definir o valor.
     * Na camada de apresentação, pode ser exibido como um controle deslizante (`<input type="range">` ou um `slider` de UI).
     */
    String SLIDER = "slider";

    /**
     * Controle para entradas de texto de várias linhas.
     *
     * Exemplo de uso: Campos como "Descrição", "Comentários" ou "Endereço", onde o usuário precisa de mais espaço para digitar.
     * Na camada de apresentação, pode ser exibido como uma área de texto (`<textarea>`).
     */
    String TEXTAREA = "textarea";

    /**
     * Controle booleano alternativo que funciona como um botão de alternância.
     *
     * Exemplo de uso: Campos como "Modo Escuro" ou "Notificações Ativadas", onde o usuário ativa ou desativa uma configuração.
     * Na camada de apresentação, pode ser exibido como um toggle button (`<mat-button-toggle>` ou `<input type="checkbox">` com estilo de toggle).
     */
    String TOGGLE = "toggle";

    /**
     * Controle para entrada de texto enriquecido, permitindo formatação de texto.
     *
     * Exemplo de uso: Campos como "Descrição Completa" ou "Anotações", onde o usuário precisa formatar o texto com opções como negrito, itálico, etc.
     * Na camada de apresentação, pode ser exibido como um editor de texto rico (WYSIWYG) com opções de formatação.
     */
    String RICH_TEXT_EDITOR = "richTextEditor";
    /**
     * Controle para seleção de uma data.
     *
     * Exemplo de uso: Campos como "Data de Nascimento" ou "Data de Início".
     * Na camada de apresentação, pode ser exibido como um controle de calendário (`<input type="date">`).
     */
    String DATE_PICKER = "date";

    /**
     * Controle para seleção de uma data e hora.
     *
     * Exemplo de uso: Campos como "Data e Hora do Evento" ou "Data de Criação".
     * Na camada de apresentação, pode ser exibido como um controle de calendário com opções de hora (`<input type="datetime-local">`).
     */
    String DATE_TIME_PICKER = "dateTime";

    /**
     * Controle para seleção de múltiplas opções.
     *
     * Exemplo de uso: Campos como "Interesses" ou "Tags", onde o usuário pode selecionar várias opções de uma lista.
     * Na camada de apresentação, pode ser exibido como uma lista de checkboxes ou um multiselect.
     */
    String MULTI_SELECT = "multiSelect";

    /**
     * Controle para upload de arquivos.
     *
     * Exemplo de uso: Campos como "Anexo de Arquivo" ou "Imagem de Perfil", onde o usuário precisa fazer upload de arquivos.
     * Na camada de apresentação, pode ser exibido como um campo de upload (`<input type="file">`).
     */
    String FILE_UPLOAD = "upload";

    /**
     * Controle para entrada de uma senha ou informação sigilosa.
     *
     * Exemplo de uso: Campos como "Senha" ou "PIN", onde o texto precisa estar mascarado.
     * Na camada de apresentação, pode ser exibido como `<input type="password">`.
     */
    String PASSWORD = "password";

    /**
     * Controle para entrada de um valor monetário, com máscara para valores numéricos e moedas.
     *
     * Exemplo de uso: Campos como "Valor do Pedido" ou "Salário", onde o usuário insere um valor monetário.
     * Na camada de apresentação, pode ser exibido como um input com máscara de moeda.
     */
    String CURRENCY_INPUT = "currency";

    /**
     * Controle para entrada de uma cor.
     *
     * Exemplo de uso: Campos como "Cor de Fundo" ou "Cor do Texto", onde o usuário escolhe uma cor.
     * Na camada de apresentação, pode ser exibido como um seletor de cores (`<input type="color">`).
     */
    String COLOR_PICKER = "colorPicker";

    /**
     * Controle para entrada de URL.
     *
     * Exemplo de uso: Campos como "Website" ou "Link do Perfil", onde o usuário insere uma URL.
     * Na camada de apresentação, pode ser exibido como `<input type="url">`.
     */
    String URL_INPUT = "url";

    /**
     * Controle para exibir uma lista de itens em formato de árvore.
     *
     * Exemplo de uso: Campos como "Categoria de Produto" onde itens podem ser organizados em uma hierarquia.
     * Na camada de apresentação, pode ser exibido como um TreeView.
     */
    String TREE_VIEW = "treeView";

    /**
     * Controle para exibir chips (elementos de marcação).
     *
     * Exemplo de uso: Campos como "Tags" onde cada tag é exibida como um chip.
     * Na camada de apresentação, pode ser exibido como uma lista de chips que o usuário pode adicionar ou remover.
     */
    String CHIP_INPUT = "chipInput";

    /**
     * Controle para exibir um painel expansível, com conteúdo que pode ser expandido ou colapsado.
     *
     * Exemplo de uso: Campos de detalhes adicionais que não precisam estar sempre visíveis.
     * Na camada de apresentação, pode ser exibido como um Expansion Panel.
     */
    String EXPANSION_PANEL = "expansionPanel";

    /**
     * Controle para visualização de progresso em uma barra.
     *
     * Exemplo de uso: Campos de progresso de carregamento ou status de tarefas.
     * Na camada de apresentação, pode ser exibido como uma barra de progresso.
     */
    String PROGRESS_BAR = "progressBar";

    /**
     * Controle para visualização de progresso em um indicador circular.
     *
     * Exemplo de uso: Indicar o progresso de uma tarefa em andamento.
     * Na camada de apresentação, pode ser exibido como um progress spinner.
     */
    String PROGRESS_SPINNER = "progressSpinner";

    /**
     * Controle de paginador, para navegação em listas paginadas de dados.
     *
     * Exemplo de uso: Exibir controles de paginação para tabelas ou listas grandes.
     */
    String PAGINATOR = "paginator";

    /**
     * Controle de diálogo modal, para exibir informações ou interações no centro da tela.
     *
     * Exemplo de uso: Alertas, confirmações ou formulários rápidos.
     * Na camada de apresentação, pode ser exibido como um diálogo.
     */
    String DIALOG = "dialog";

    /**
     * Controle de tabela de dados com capacidade de classificação e filtro.
     *
     * Exemplo de uso: Exibição de uma lista de itens com várias colunas e funcionalidades de ordenação.
     */
    String SORTABLE_TABLE = "sortableTable";

    /**
     * Controle de visualização de etapas em um fluxo sequencial.
     *
     * Exemplo de uso: Fluxos de cadastro ou formulários com várias etapas.
     * Na camada de apresentação, pode ser exibido como um Stepper.
     */
    String STEPPER = "stepper";

    /**
     * Controle de visualização de abas, para organizar conteúdo em seções navegáveis.
     *
     * Exemplo de uso: Exibir diferentes seções de conteúdo como abas.
     * Na camada de apresentação, pode ser exibido como um componente Tabs.
     */
    String TABS = "tabs";

    /**
     * Controle de exibição de avatar, geralmente uma imagem ou ícone representando um usuário.
     *
     * Exemplo de uso: Exibir a imagem de perfil ou iniciais de um usuário.
     * Na camada de apresentação, pode ser exibido como um componente de avatar circular ou quadrado.
     */
    String AVATAR = "avatar";

    /**
     * Controle de card para organizar informações de forma destacada em um contêiner.
     *
     * Exemplo de uso: Apresentação de informações de perfil, produtos ou resumos.
     * Na camada de apresentação, pode ser exibido como um card com título, imagem e ações.
     */
    String CARD = "card";

    /**
     * Controle de menu contextual, geralmente ativado por clique direito.
     *
     * Exemplo de uso: Exibir opções relacionadas a um item selecionado.
     * Na camada de apresentação, pode ser exibido como um menu que aparece próximo ao ponto de clique.
     */
    String CONTEXT_MENU = "contextMenu";

    /**
     * Layout de grade para organizar elementos em uma estrutura de colunas e linhas.
     *
     * Exemplo de uso: Organizar componentes em uma grade para layouts responsivos.
     * Na camada de apresentação, pode ser exibido como um grid layout com várias colunas e linhas.
     */
    String GRID_LAYOUT = "gridLayout";

    /**
     * Controle de lista de visualização de itens em um formato de lista.
     *
     * Exemplo de uso: Exibir itens, como contatos ou mensagens, em uma lista rolável.
     */
    String LIST_VIEW = "listView";

    /**
     * Controle de notificação para exibir mensagens rápidas ao usuário.
     *
     * Exemplo de uso: Informar o usuário sobre o sucesso de uma operação ou erro.
     * Na camada de apresentação, pode ser exibido como um pop-up ou mensagem flutuante.
     */
    String NOTIFICATION = "notification";

    /**
     * Controle de pop-up para exibir conteúdo adicional sobreposto.
     *
     * Exemplo de uso: Exibir detalhes de um item sem sair da página atual.
     */
    String POPUP = "popup";

    /**
     * Efeito ripple para destacar a interação do usuário.
     *
     * Exemplo de uso: Feedback visual em botões ou ícones clicáveis.
     */
    String RIPPLE = "ripple";

    /**
     * Controle de layout de rolagem para exibir conteúdo longo em uma área limitada.
     *
     * Exemplo de uso: Visualizar listas ou conteúdo extenso dentro de um espaço fixo.
     */
    String SCROLL_VIEW = "scrollView";

    /**
     * Controle para organização de itens que podem ser arrastados e soltos.
     *
     * Exemplo de uso: Ordenar itens em uma lista de forma interativa.
     */
    String SORTABLE = "sortable";

    /**
     * Controle divisor para redimensionamento de áreas.
     *
     * Exemplo de uso: Ajustar o tamanho de colunas ou seções em um layout.
     */
    String SPLITTER = "splitter";

    /**
     * Controle de layout empilhado para organizar componentes em uma coluna ou linha.
     *
     * Exemplo de uso: Organizar botões ou formulários em uma coluna vertical.
     */
    String STACK_LAYOUT = "stackLayout";

    /**
     * Controle de barra de etapas para guiar o usuário através de um processo em etapas.
     *
     * Exemplo de uso: Fluxo de cadastro com várias etapas.
     */
    String STEP_BAR = "stepBar";

    /**
     * Controle de linha do tempo para exibir eventos em sequência cronológica.
     *
     * Exemplo de uso: Exibir o histórico de atividades ou eventos importantes.
     */
    String TIMELINE = "timeline";

    /**
     * Controle de barra de ferramentas para agrupar botões de ações.
     *
     * Exemplo de uso: Barra de ferramentas com ações como "Salvar", "Editar", "Excluir".
     */
    String TOOLBAR = "toolbar";

    /**
     * Controle de dica que exibe informações adicionais ao passar o mouse sobre um item.
     *
     * Exemplo de uso: Mostrar uma descrição breve ao passar o mouse sobre um ícone.
     */
    String TOOLTIP = "tooltip";

    /**
     * Controle de caixa de texto com máscara, que permite ao usuário inserir dados formatados.
     *
     * Exemplo de uso: Campos como "Telefone" ou "CPF", onde o formato de entrada é guiado.
     * Na camada de apresentação, pode ser exibido como um input com máscara.
     */
    String MASKED_TEXT_BOX = "maskedTextBox";

    /**
     * Controle de caixa de texto numérica, permitindo apenas a entrada de valores numéricos.
     *
     * Exemplo de uso: Campos como "Quantidade" ou "Preço", onde apenas números são permitidos.
     * Na camada de apresentação, pode ser exibido como um input numérico.
     */
    String NUMERIC_TEXT_BOX = "numericTextBox";

    /**
     * Controle para selecionar uma cor em uma paleta de gradiente.
     *
     * Exemplo de uso: Campos como "Cor de Fundo", permitindo um controle fino sobre a escolha de cores.
     * Na camada de apresentação, pode ser exibido como um seletor de cor em gradiente.
     */
    String COLOR_GRADIENT = "colorGradient";

    /**
     * Controle para selecionar uma cor a partir de uma paleta de cores.
     *
     * Exemplo de uso: Campos como "Cor do Texto" ou "Cor de Destaque".
     * Na camada de apresentação, pode ser exibido como uma paleta de cores.
     */
    String COLOR_PALETTE = "colorPalette";

    /**
     * Controle de seletor de faixa de valores numéricos, útil para seleção de intervalos.
     *
     * Exemplo de uso: Campos como "Faixa de Preço" ou "Intervalo de Datas" com valores numéricos.
     * Na camada de apresentação, pode ser exibido como um slider de faixa.
     */
    String RANGE_SLIDER = "rangeSlider";

    /**
     * Controle de avaliação para captura de classificações do usuário, geralmente em estrelas.
     *
     * Exemplo de uso: Campos como "Avaliação do Produto" ou "Classificação de Serviço".
     * Na camada de apresentação, pode ser exibido como um controle de estrelas ou ícones de classificação.
     */
    String RATING = "rating";

    /**
     * Controle de assinatura para capturar a assinatura digital do usuário.
     *
     * Exemplo de uso: Campos onde o usuário precisa fornecer uma assinatura digital.
     * Na camada de apresentação, pode ser exibido como uma área de desenho.
     */
    String SIGNATURE = "signature";

    /**
     * Controle para gerar códigos de barras.
     *
     * Exemplo de uso: Exibição de códigos de barras para identificação de produtos ou documentos.
     * Na camada de apresentação, pode ser exibido como um gerador de código de barras.
     */
    String BARCODE_GENERATOR = "barcodeGenerator";

    /**
     * Controle para gerar códigos QR.
     *
     * Exemplo de uso: Exibição de códigos QR para compartilhamento de links ou informações.
     * Na camada de apresentação, pode ser exibido como um gerador de QR code.
     */
    String QR_CODE = "qrCode";

    /**
     * Controle de filtro para permitir ao usuário filtrar dados exibidos.
     *
     * Exemplo de uso: Filtragem de listas ou tabelas com base em critérios especificados pelo usuário.
     * Na camada de apresentação, pode ser exibido como um painel ou campo de filtro.
     */
    String FILTER = "filter";

    /**
     * Controle de paginador, para navegação em grandes conjuntos de dados.
     *
     * Exemplo de uso: Exibir controles de paginação para listas ou tabelas extensas.
     * Na camada de apresentação, pode ser exibido como controles de página (anterior, próximo).
     */
    String PAGER = "pager";

    /**
     * Controle de auto-completar para entradas de texto.
     *
     * Exemplo de uso: Campos de pesquisa onde sugestões são exibidas conforme o usuário digita.
     * Na camada de apresentação, pode ser exibido como um campo de entrada com sugestões automáticas.
     */
    String AUTO_COMPLETE = "autoComplete";

    /**
     * Controle de combo box com várias colunas.
     *
     * Exemplo de uso: Seleção de itens com múltiplas propriedades, como um produto com nome e código.
     * Na camada de apresentação, pode ser exibido como um combo box com múltiplas colunas.
     */
    String MULTI_COLUMN_COMBO_BOX = "multiColumnComboBox";

    /**
     * Controle de árvore de dropdown, permitindo a seleção em uma estrutura hierárquica.
     *
     * Exemplo de uso: Seleção de categorias organizadas em hierarquia.
     * Na camada de apresentação, pode ser exibido como um dropdown com estrutura de árvore.
     */
    String DROP_DOWN_TREE = "dropDownTree";

    /**
     * Controle de seleção múltipla em estrutura de árvore.
     *
     * Exemplo de uso: Seleção de múltiplas categorias ou itens dentro de uma hierarquia.
     * Na camada de apresentação, pode ser exibido como um multi-select em árvore.
     */
    String MULTI_SELECT_TREE = "multiSelectTree";

    /**
     * Controle de gauge em arco para exibir valores em formato semi-circular.
     *
     * Exemplo de uso: Indicadores de desempenho ou progresso, como "Carga da CPU".
     * Na camada de apresentação, pode ser exibido como um gauge em arco.
     */
    String ARC_GAUGE = "arcGauge";

    /**
     * Controle de gauge circular para exibir valores em um círculo completo.
     *
     * Exemplo de uso: Indicadores de progresso ou valores percentuais.
     * Na camada de apresentação, pode ser exibido como um gauge circular.
     */
    String CIRCULAR_GAUGE = "circularGauge";

    /**
     * Controle de gauge linear para exibir valores em formato linear.
     *
     * Exemplo de uso: Indicadores de nível ou status em formato de barra linear.
     * Na camada de apresentação, pode ser exibido como um gauge linear.
     */
    String LINEAR_GAUGE = "linearGauge";

    /**
     * Controle de gauge radial para exibir valores em um formato radial.
     *
     * Exemplo de uso: Medidores que mostram valores angulares, como "Direção do Vento".
     * Na camada de apresentação, pode ser exibido como um gauge radial.
     */
    String RADIAL_GAUGE = "radialGauge";

    /**
     * Controle de grade para exibição de dados tabulares.
     *
     * Exemplo de uso: Exibição de listas ou tabelas com múltiplas colunas.
     * Na camada de apresentação, pode ser exibido como uma tabela com recursos de ordenação e filtro.
     */
    String GRID = "grid";

    /**
     * Controle de PivotGrid para exibição de dados em um formato de tabela dinâmica.
     *
     * Exemplo de uso: Visualização de dados agregados, como relatórios de vendas por região e produto.
     * Na camada de apresentação, pode ser exibido como uma tabela dinâmica.
     */
    String PIVOT_GRID = "pivotGrid";

    /**
     * Controle de planilha, oferecendo funcionalidades de edição em formato de tabela semelhante ao Excel.
     *
     * Exemplo de uso: Edição de grandes conjuntos de dados ou gerenciamento de planilhas.
     * Na camada de apresentação, pode ser exibido como uma planilha editável.
     */
    String SPREADSHEET = "spreadsheet";

    /**
     * Controle de salvamento de arquivo.
     *
     * Exemplo de uso: Opções para salvar arquivos gerados ou exportados.
     * Na camada de apresentação, pode ser exibido como um botão ou link de download.
     */
    String FILE_SAVER = "fileSaver";

    /**
     * Controle de seleção de arquivo, para que o usuário escolha arquivos do sistema.
     *
     * Exemplo de uso: Seleção de arquivos para upload ou processamento.
     * Na camada de apresentação, pode ser exibido como um botão de seleção de arquivo.
     */
    String FILE_SELECT = "fileSelect";

    /**
     * Controle de calendário para seleção de uma data específica.
     *
     * Exemplo de uso: Exibir um calendário completo para seleção de datas.
     * Na camada de apresentação, pode ser exibido como um calendário interativo.
     */
    String CALENDAR = "calendar";

    /**
     * Controle de intervalo de datas, permitindo a seleção de uma data inicial e final.
     *
     * Exemplo de uso: Campos como "Período de Férias" ou "Intervalo de Relatório".
     * Na camada de apresentação, pode ser exibido como um seletor de intervalo de datas.
     */
    String DATE_RANGE = "dateRange";

    /**
     * Controle para seleção de horas.
     *
     * Exemplo de uso: Campos como "Hora de Início" ou "Hora do Alarme".
     * Na camada de apresentação, pode ser exibido como um controle de seleção de horas.
     */
    String TIME_PICKER = "timePicker";

    /**
     * Controle de janela de diálogo, que pode ser exibido em estilo de janela.
     *
     * Exemplo de uso: Exibir informações adicionais ou formulários em uma nova janela de diálogo.
     */
    String WINDOW = "window";

    /**
     * Controle de rótulo flutuante, exibindo um texto descritivo associado a um campo.
     *
     * Exemplo de uso: Rótulo que indica o propósito de um campo em formulários.
     */
    String FLOATING_LABEL = "floatingLabel";

    /**
     * Controle para exibir ícones SVG, permitindo o uso de ícones personalizados em SVG.
     *
     * Exemplo de uso: Ícones que representam ações ou estados, como "Editar", "Excluir".
     * Na camada de apresentação, pode ser exibido como um ícone SVG personalizado.
     */
    String SVG_ICON = "svgIcon";

    /**
     * Controle para configuração de tipografia.
     *
     * Exemplo de uso: Definir estilo de texto, como cabeçalhos e parágrafos com diferentes tamanhos e pesos.
     */
    String TYPOGRAPHY = "typography";

    /**
     * Controle de barra de navegação no topo da aplicação.
     *
     * Exemplo de uso: Barra de navegação com links para diferentes seções da aplicação.
     * Na camada de apresentação, pode ser exibido como uma AppBar ou NavBar.
     */
    String APP_BAR = "appBar";

    /**
     * Controle de navegação inferior, comum em aplicativos mobile.
     *
     * Exemplo de uso: Navegação entre páginas principais em um aplicativo mobile.
     * Na camada de apresentação, pode ser exibido como uma barra de navegação inferior.
     */
    String BOTTOM_NAVIGATION = "bottomNavigation";

    /**
     * Controle de navegação Breadcrumb para exibir a localização atual do usuário em uma hierarquia.
     *
     * Exemplo de uso: Navegação em sistemas complexos com várias camadas, como "Página Inicial > Produtos > Eletrônicos".
     */
    String BREADCRUMB = "breadcrumb";

    /**
     * Controle de menu do tipo "drawer", geralmente usado para navegação em dispositivos móveis.
     *
     * Exemplo de uso: Menu lateral que desliza para dentro, contendo opções de navegação.
     */
    String DRAWER = "drawer";

    /**
     * Controle de grupo de botões, onde várias opções de botão são agrupadas.
     *
     * Exemplo de uso: Botões de ação relacionados ou categorias de opções.
     * Na camada de apresentação, pode ser exibido como um grupo de botões.
     */
    String BUTTON_GROUP = "buttonGroup";

    /**
     * Controle de chip para exibir elementos como tags ou seleções com possibilidade de remoção.
     *
     * Exemplo de uso: Marcação de itens, como categorias ou interesses.
     * Na camada de apresentação, pode ser exibido como um conjunto de chips.
     */
    String CHIP_LIST = "chipList";

    /**
     * Controle de botão de ação flutuante, geralmente usado para uma ação principal na interface.
     *
     * Exemplo de uso: Botão de ação principal em uma tela, como "Adicionar" ou "Nova Tarefa".
     * Na camada de apresentação, pode ser exibido como um botão flutuante.
     */
    String FLOATING_ACTION_BUTTON = "floatingActionButton";

    /**
     * Controle para exibição de documentos em PDF.
     *
     * Exemplo de uso: Visualização de arquivos PDF diretamente na interface.
     * Na camada de apresentação, pode ser exibido como um visualizador de PDF embutido.
     */
    String PDF_VIEWER = "pdfViewer";

    /**
     * Controle de inteligência artificial para prompts de interação com o usuário.
     *
     * Exemplo de uso: Solicitar sugestões ou respostas automáticas através de IA.
     * Na camada de apresentação, pode ser exibido como uma interface de prompt de IA.
     */
    String AI_PROMPT = "aiPrompt";

    /**
     * Controle de UI conversacional, usado para chatbots ou assistentes virtuais.
     *
     * Exemplo de uso: Interação com um bot ou assistente digital.
     * Na camada de apresentação, pode ser exibido como uma interface de chat.
     */
    String CONVERSATIONAL_UI = "conversationalUI";

    /**
     * Controle de mapa para exibir localizações geográficas.
     *
     * Exemplo de uso: Exibir uma localização, traçar rotas ou marcar pontos de interesse.
     * Na camada de apresentação, pode ser exibido como um mapa interativo.
     */
    String MAP = "map";
}

