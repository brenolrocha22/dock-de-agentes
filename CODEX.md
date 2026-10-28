# Dock de Agentes — Instruções de Desenvolvimento

## 1. Visão do produto

Construir uma aplicação desktop para Windows que funcione como um dock flutuante e minimalista para invocar agentes de inteligência artificial.

O usuário poderá acessar agentes especializados por meio de ícones, executar rotinas em segundo plano e acompanhar o estado das tarefas sem interromper seu fluxo de trabalho.

O projeto está na fase V1. Priorizar simplicidade, estabilidade, baixo consumo de recursos e facilidade de manutenção.

## 2. Objetivos da V1

1. Criar um dock flutuante com fundo transparente e sem bordas.
2. Exibir um ícone compacto quando o dock estiver recolhido.
3. Expandir os botões dos agentes ao passar o cursor sobre o dock.
4. Permitir executar agentes por meio de botões.
5. Executar tarefas sem bloquear a interface.
6. Exibir estados de execução, conclusão e erro.
7. Preparar a integração com o Claude Agent SDK.
8. Persistir configurações localmente.
9. Preparar a inicialização com o Windows.
10. Produzir uma aplicação instalável no Windows.

Não implementar funcionalidades fora desse escopo sem necessidade comprovada.

## 3. Stack tecnológica

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Motion for React, se necessário

Aplicação desktop:
- Tauri 2
- Rust

Execução de agentes:
- Claude Agent SDK para TypeScript
- Processo Node.js separado para execução dos agentes, quando necessário

Persistência:
- SQLite, quando a persistência for implementada

Desenvolvimento:
- Windows 10
- Visual Studio Code
- npm
- Git

Antes de adicionar uma biblioteca, verificar se já existe uma dependência adequada no projeto.

Não adicionar dependências desnecessárias.

## 4. Arquitetura

Manter três responsabilidades separadas:

### Interface
Responsável por:
- Renderizar o dock.
- Exibir os ícones dos agentes.
- Controlar animações.
- Mostrar estados e notificações.
- Receber interações do usuário.

### Core desktop
Responsável por:
- Gerenciar a janela.
- Controlar eventos nativos.
- Coordenar a comunicação com os agentes.
- Gerenciar configurações e permissões.

### Runtime dos agentes
Responsável por:
- Executar as rotinas.
- Gerenciar tarefas em andamento.
- Retornar resultados e erros.
- Aplicar limites e permissões.

Não executar tarefas demoradas diretamente na thread principal da interface.

Não bloquear a interface durante operações assíncronas.

Não criar microsserviços ou infraestrutura remota na V1.

## 5. Diretrizes de interface

A interface deve ser minimalista, moderna e discreta.

Requisitos:
- Fundo transparente quando suportado.
- Janela sem bordas.
- Dock compacto.
- Ícones claramente identificáveis.
- Animações curtas e suaves.
- Expansão por hover.
- Indicadores discretos de atividade.
- Compatibilidade com diferentes resoluções e escalas de tela.
- Posicionamento consistente na tela.
- Interação correta com as janelas de outros aplicativos.

Não presumir que transparência e comportamento de hover funcionarão corretamente apenas com CSS.

Validar o comportamento real no Windows.

Evitar que áreas invisíveis da janela bloqueiem cliques em outros aplicativos.

Não usar efeitos visuais pesados que prejudiquem o desempenho.

## 6. Agentes

Os agentes devem ser configuráveis, evitando implementar um componente de interface exclusivo para cada agente.

Categorias iniciais:
- Code Agent
- Research Agent
- Writer Agent
- Task Agent

Cada definição de agente poderá conter:
- ID
- Nome
- Ícone
- Descrição
- Instruções
- Ferramentas permitidas
- Diretório de trabalho, quando aplicável
- Limite de turnos
- Configurações de execução

As definições devem utilizar tipos TypeScript explícitos.

Não permitir que instruções de um agente concedam permissões superiores às autorizadas pelo aplicativo.

## 7. Execução e segurança

Toda execução de agente deve ser assíncrona.

Implementar progressivamente:
- Estados de tarefa.
- Tratamento de erros.
- Cancelamento.
- Limites de execução.
- Controle de permissões.
- Registro de resultados.
- Confirmação para operações potencialmente destrutivas.

Não executar comandos arbitrários sem validação.

Não armazenar chaves de API em arquivos versionados.

Não registrar tokens, credenciais ou segredos nos logs.

Não executar agentes automaticamente com permissões irrestritas.

Respeitar os termos e requisitos de autenticação aplicáveis ao Claude Agent SDK.

## 8. Persistência

Quando implementada, a persistência local deverá armazenar apenas os dados necessários.

Possíveis dados:
- Configurações do dock.
- Definições dos agentes.
- Preferências do usuário.
- Histórico resumido de tarefas.

Não persistir informações sensíveis sem necessidade.

Não introduzir SQLite antes de existir uma necessidade funcional concreta.

## 9. Regras de desenvolvimento

Antes de modificar o projeto:

1. Inspecionar a estrutura existente.
2. Ler o package.json.
3. Verificar as dependências instaladas.
4. Examinar as configurações do Tauri.
5. Identificar o comportamento atual.
6. Fazer alterações pequenas e verificáveis.

Ao implementar funcionalidades:

- Preservar o código existente que já funciona.
- Evitar reescritas completas sem justificativa.
- Utilizar TypeScript com tipagem adequada.
- Evitar o uso indiscriminado de `any`.
- Reutilizar componentes quando isso simplificar a manutenção.
- Manter responsabilidades bem definidas.
- Não adicionar abstrações prematuras.
- Não modificar configurações de segurança sem justificativa.
- Não atualizar dependências indiscriminadamente.

## 10. Validação obrigatória

Após cada alteração relevante:

1. Executar a verificação de tipos, se disponível.
2. Executar o lint, se configurado.
3. Executar os testes existentes, se aplicável.
4. Executar o build do frontend.
5. Validar o build do Tauri quando necessário.
6. Testar visualmente as alterações no Windows.

Utilizar os scripts existentes no package.json.

Não afirmar que uma validação passou sem ter executado o comando correspondente.

Se uma validação falhar, identificar a causa antes de continuar.

Não ocultar erros com supressões de tipos ou desativação indiscriminada de regras.

## 11. Escopo de infraestrutura

Não utilizar Docker por padrão.

Priorizar o desenvolvimento nativo no Windows.

Adicionar Docker somente quando houver uma necessidade técnica concreta.

Não criar backend remoto, autenticação própria, sincronização em nuvem ou sistema de plugins na V1.

## 12. Estratégia de implementação

Desenvolver nesta ordem:

Fase 1:
- Verificar o ambiente.
- Validar a estrutura Tauri + React.
- Garantir que o aplicativo execute.

Fase 2:
- Criar o dock visual.
- Implementar a expansão por hover.
- Validar transparência, posicionamento e interação com outras janelas.

Fase 3:
- Implementar as definições dos agentes.
- Criar o fluxo assíncrono de tarefas.
- Exibir os estados de execução.

Fase 4:
- Integrar o Claude Agent SDK.
- Implementar permissões e cancelamento.
- Testar uma rotina real de ponta a ponta.

Fase 5:
- Implementar persistência e inicialização com o Windows.
- Preparar o empacotamento.
- Realizar a validação final da V1.

Não avançar para integrações complexas antes de validar as etapas anteriores.

## 13. Protocolo de trabalho do assistente de programação

Antes de implementar uma funcionalidade:
- Explicar brevemente o objetivo.
- Identificar os arquivos que serão alterados.
- Evitar perguntas quando