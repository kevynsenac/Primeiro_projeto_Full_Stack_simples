Diário de Corrida (Full-Stack App)

Este é um projeto simples de CRUD (Create, Read, Update, Delete) full-stack que simula um diário de registo de corridas. A aplicação permite ao utilizador registar, visualizar, editar e apagar corridas, que são guardadas numa base de dados local.

O objetivo deste projeto é demonstrar a integração entre um backend .NET Web API e um frontend em HTML, CSS e JavaScript puros, utilizando uma base de dados SQLite.

Tecnologias Utilizadas

Backend:

.NET 8 (ou 6+) Web API

Entity Framework Core

SQLite (para a base de dados)

Swagger / OpenAPI (para documentação da API)

CORS (para permitir a comunicação com o frontend)

Frontend:

HTML5

CSS3 (moderno, com Flexbox)

JavaScript (ES6+ moderno)

fetch API (para consumir o backend)

Ambiente de Desenvolvimento:

Visual Studio Code

Extensão C# Dev Kit

Extensão Live Server

Funcionalidades Implementadas

Criar (Create): Guardar uma nova corrida através do formulário.

Ler (Read): Listar o histórico de corridas ao carregar a página.

Atualizar (Update): Editar uma corrida existente (o formulário é pré-preenchido).

Apagar (Delete): Remover uma corrida do histórico e da base de dados.

Extra: Cálculo de "Pace" (min/km) feito no lado do cliente (frontend).

Extra: Botão para preenchimento aleatório de dados para testes rápidos.

Como Executar o Projeto

Para executar este projeto localmente, são necessários dois terminais.

Pré-requisitos

.NET SDK (versão 8 ou 6+)

VS Code

Extensão C# Dev Kit (para o VS Code)

Extensão Live Server (para o VS Code)

A ferramenta dotnet-ef (instalar globalmente com dotnet tool install --global dotnet-ef)

1. Backend (A API)

Abra um terminal e navegue até à pasta backend:

cd backend


Instale os pacotes .NET (apenas na primeira vez):

dotnet restore


Crie a base de dados SQLite a partir das migrações (apenas na primeira vez):

dotnet ef database update


Inicie o servidor da API:

dotnet run


A API estará em execução (ex: http://localhost:5184). Pode verificar a API no Swagger em http://localhost:5184/swagger.

2. Frontend (O Site)

Num novo terminal, ou no explorador de ficheiros do VS Code:

Clique com o botão direito no ficheiro frontend/index.html.

Selecione "Open with Live Server".

O seu navegador será aberto automaticamente (ex: http://127.0.0.1:5500) e a aplicação estará pronta a ser utilizada.
