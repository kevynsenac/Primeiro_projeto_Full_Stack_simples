using CorridaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CorridaApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Define as duas tabelas
        public DbSet<Usuario> tb_usuarios { get; set; }
        public DbSet<Corrida> tb_corridas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define a relação: Um Utilizador TEM MUITAS Corridas
            // Uma Corrida PERTENCE A UM Utilizador
            modelBuilder.Entity<Usuario>()
                .HasMany(u => u.Corridas) // Um utilizador tem muitas corridas
                .WithOne(c => c.Usuario)  // Uma corrida tem um utilizador
                .HasForeignKey(c => c.UsuarioId) // A chave é UsuarioId
                .OnDelete(DeleteBehavior.Cascade); // Se apagar um utilizador, apaga as suas corridas
        }
    }
}