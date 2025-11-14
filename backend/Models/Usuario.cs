using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CorridaApi.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string NomeUsuario { get; set; } = string.Empty;

        [Required]
        [JsonIgnore] // Nunca exponha a senha na API
        public string SenhaHash { get; set; } = string.Empty;

        // Relação: Um utilizador pode ter muitas corridas
        public ICollection<Corrida> Corridas { get; set; } = new List<Corrida>();
    }
}