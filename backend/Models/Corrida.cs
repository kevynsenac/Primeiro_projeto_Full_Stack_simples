using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CorridaApi.Models
{
    public class Corrida
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Data { get; set; }

        [Required]
        public double DistanciaKm { get; set; }

        [Required]
        public int TempoMinutos { get; set; }

        public string? Local { get; set; }

        // --- A GRANDE MUDANÇA (INÍCIO) ---
        // Chave Estrangeira para o Utilizador
        [Required]
        public int UsuarioId { get; set; }

        // Propriedade de Navegação (para o EF Core entender a relação)
        [JsonIgnore] // Não envie o objeto utilizador inteiro de volta
        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }
        // --- A GRANDE MUDANÇA (FIM) ---
    }
}