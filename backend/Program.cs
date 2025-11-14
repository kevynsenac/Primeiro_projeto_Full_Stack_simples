using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using CorridaApi.Data;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Configuração dos Serviços ---

// Adiciona o HttpContextAccessor (para sabermos quem está logado)
builder.Services.AddHttpContextAccessor();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString)
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CONFIGURAÇÃO DE AUTENTICAÇÃO (COOKIES) ---
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "DiarioCorrida.AuthCookie";
        options.Cookie.HttpOnly = true; // O JavaScript não pode ler o cookie
        
        // --- MUDANÇA AQUI ---
        // 'Lax' permite que o cookie seja enviado durante a navegação (o redirect)
        // 'Strict' (o seu anterior) bloqueava isto, causando o loop.
        options.Cookie.SameSite = SameSiteMode.Lax; 
        
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        
        // Define o que acontece se um utilizador NÃO autorizado tentar aceder
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = 401; // Unauthorized
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = 403; // Forbidden
            return Task.CompletedTask;
        };
    });

// Configura o CORS (IMPORTANTE: AllowCredentials é obrigatório para cookies)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            // Endereço do Live Server (garanta que é o seu)
            policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // <-- OBRIGATÓRIO PARA LOGIN
        });
});

var app = builder.Build();

// --- 2. Configuração do Pipeline HTTP ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// app.UseHttpsRedirection(); // Mantenha comentado

// --- ATIVAR AUTENTICAÇÃO E AUTORIZAÇÃO ---
// A ordem é crucial!
app.UseAuthentication(); // 1. Quem é você? (Lê o cookie)
app.UseAuthorization();  // 2. Você pode fazer isto? (Verifica [Authorize])

app.MapControllers();
app.Run();