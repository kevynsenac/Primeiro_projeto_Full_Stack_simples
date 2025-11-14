Diário de Corrida (Full-Stack .NET + JS)

Sobre o Projeto:
Este é um projeto full-stack completo que implementa um "Diário de Corrida" digital. A aplicação permite que múltiplos utilizadores criem contas e façam a gestão (CRUD completo) dos seus próprios registos de atividade física, com os dados de cada utilizador separados de forma segura.

O objetivo principal é demonstrar uma integração robusta entre um backend .NET Web API e um frontend em JavaScript (Vanilla), utilizando um sistema de autenticação por Cookies (Sessões) para segurança.
A aplicação utiliza SQLite como base de dados, tornando o projeto leve, portátil e fácil de executar, uma vez que a base de dados é um único ficheiro local.

Funcionalidades Implementadas
Sistema de Autenticação:

- Registo: Criação de novos utilizadores (nome e senha) com encriptação de senha (BCrypt).
- Login: Autenticação segura que gera um Cookie de sessão (HttpOnly, SameSite=Lax).
- Logout: Invalidação do cookie de sessão.
- Segurança: A aplicação "expulsa" utilizadores não autenticados de volta para a página de login.

CRUD de Corridas (separado por utilizador):
- Criar (Create): Guardar novas corridas (o backend atribui-as automaticamente ao utilizador logado).
- Ler (Read): Listar apenas as corridas que pertencem ao utilizador logado.
- Atualizar (Update): Editar uma corrida existente (com verificação de propriedade).
- Apagar (Delete): Remover uma corrida (com verificação de propriedade).

Frontend:
- Cálculo de "Pace" (min/km) feito no lado do cliente.
- Botão "Preencher Aleatório" para testes rápidos.
- Design moderno dark mode.

Tecnologias Utilizadas
Backend:
- .NET 8 (Web API)
- Entity Framework Core
- Autenticação .NET (Cookies)
- BCrypt.Net (para Hashing de Senhas)
- Swagger / OpenAPI

Frontend:
- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (ES6+ com fetch API e gestão de credentials)

Base de Dados:
- SQLite

1. Software Necessário (Pré-requisitos)
Antes de executar, garanta que tem o seguinte software instalado:
* [.NET SDK]: Versão 8.0 ou 9.0 (necessário para dotnet run).
* [Visual Studio Code]: O editor de código.

Extensões do VSCode:
* C# Dev Kit (da Microsoft): Essencial para o desenvolvimento C#.
* Live Server (de ritwickdey): Para executar o frontend.
* SQLite (de alexcvzz): (Opcional) Para visualizar a base de dados corridas.db.
* Ferramenta dotnet-ef: Necessária para criar a base de dados. Instale-a globalmente (uma única vez) no seu Terminal/PowerShell: dotnet tool install --global dotnet-ef

2. Configuração ANTES de Executar (Crucial)
Existem duas configurações que têm de ser feitas para que o login funcione no seu PC.

A. Alteração no VSCode (Corrigir o "Loop de Login")
Este é o passo mais importante. O "loop de login" (onde o dashboard pisca e volta ao login) acontece porque o navegador trata http://127.0.0.1 e http://localhost como "sites" diferentes, bloqueando o cookie de autenticação.

A Solução é forçar o Live Server a usar localhost:
No VSCode, abra as Definições:
- (Windows/Linux): File > Preferences > Settings
- (macOS): Code > Preferences > Settings
- (Atalho): Ctrl + ,
- Na barra de pesquisa, escreva: Live Server Host
- Encontrará a definição Live Server > Settings: Host.
- Mude o valor de "127.0.0.1" para "localhost".
- Feche as Definições. O VSCode salva automaticamente.

B. Alteração no Código (Ajustar a Porta da API)
O seu frontend (JavaScript) precisa de saber em que porta o seu backend (.NET) está a ser executado.

Descubra a Porta do Backend:
- Abra um terminal (atalho "Ctrl + J"), navegue até à pasta backend (com "cd backend").
- Execute "dotnet run".
- O terminal dirá em qual porta a API está a ouvir (ex: Now listening on: http://localhost:5184).

Atualize o Frontend:
- Abra o ficheiro "frontend/login.js".
- No topo, altere a constante "API_AUTH_URL" para a porta correta:
// Exemplo: se a sua porta for 5184
- const API_AUTH_URL = 'http://localhost:5184/api/Auth';

Abra o ficheiro frontend/dashboard.js.
- No topo, altere as constantes "API_CORRIDAS_URL" e "API_AUTH_URL"  para a mesma porta:

// Exemplo:
- const API_CORRIDAS_URL = 'http://localhost:5184/api/Corridas';
- const API_AUTH_URL = 'http://localhost:5184/api/Auth';

3. Como Executar o Projeto
Com as configurações acima feitas, o processo é simples. Você precisará de dois terminais abertos.

A. Terminal 1: Executar o Backend (API)
- Abra o Terminal Integrado do VSCode (atalho "Ctrl + J").
- Navegue até à pasta backend (com "cd backend")

- (Só na primeira vez) Instale os pacotes .NET:
dotnet restore

- (Só na primeira vez) Crie a base de dados corridas.db a partir do código:
dotnet ef database update

- Inicie o servidor da API:
dotnet run

- Mantenha este terminal em execução.

B. Terminal 2: Executar o Frontend (Site)
- No Explorador de Ficheiros do VSCode (à esquerda), navegue até à pasta frontend.
- Clique com o botão direito no ficheiro "frontend/login.html".
- Selecione "Open with Live Server".

O seu navegador será aberto automaticamente (ex: http://localhost:5500/frontend/login.html) e a aplicação estará pronta a ser utilizada.
Pode registar um novo utilizador e testar o CRUD.