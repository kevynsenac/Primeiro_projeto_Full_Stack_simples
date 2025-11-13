using Microsoft.EntityFrameworkCore;
using CorridaApi.Data;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Configuração dos Serviços ---

// Obtém a string de conexão do appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// *** Configura o DbContext para usar SQLite ***
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString) 
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
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

app.UseAuthorization();

app.MapControllers();

app.Run();