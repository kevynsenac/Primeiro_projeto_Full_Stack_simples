using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CorridaApi.Models
{
    // Modelo para a futura implementação de login
    [Table("tb_usuarios")]
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string SenhaHash { get; set; } = string.Empty;
    }
}