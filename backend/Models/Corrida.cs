using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CorridaApi.Models
{
    // Define o nome da tabela na base de dados
    [Table("tb_corridas")]
    public class Corrida
    {
        [Key] // Chave Primária
        public int Id { get; set; }

        [Required] // Campo obrigatório
        public DateTime Data { get; set; }

        [Required]
        [Column(TypeName = "decimal(10, 2)")] // Define o tipo
        public decimal DistanciaKm { get; set; }

        [Required]
        public int TempoMinutos { get; set; }

        [StringLength(200)] // Limita o tamanho do campo
        public string? Local { get; set; } // ? = Permite nulo
    }
}
