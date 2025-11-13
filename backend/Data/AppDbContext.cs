using Microsoft.EntityFrameworkCore;
using CorridaApi.Models;

namespace CorridaApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Mapeia os modelos para tabelas na base de dados
        public DbSet<Corrida> Corridas { get; set; }

        // Isso seria para a implementação de uma tela de login, mas a ideia foi descosiderada por ser trabalhoso demais e desnecessário para a proposta do trabalho
        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração de precisão para o decimal
            modelBuilder.Entity<Corrida>()
                .Property(c => c.DistanciaKm)
                .HasPrecision(10, 2);

            // Garantir que o email do utilizador seja único
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
