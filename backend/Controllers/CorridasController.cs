using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CorridaApi.Data;
using CorridaApi.Models;

namespace CorridaApi.Controllers
{
    [Route("api/[controller]")] // Rota base: "api/Corridas"
    [ApiController]
    public class CorridasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CorridasController(AppDbContext context)
        {
            _context = context;
        }

        // --- CRUD COMPLETO PARA A TABELA 'Corrida' ---

        // CREATE: POST /api/Corridas
        [HttpPost]
        public async Task<ActionResult<Corrida>> CreateCorrida(Corrida corrida)
        {
            if (corrida.DistanciaKm <= 0 || corrida.TempoMinutos <= 0)
            {
                return BadRequest("Distância e Tempo devem ser valores positivos.");
            }

            corrida.Data = corrida.Data.ToUniversalTime(); // Garante fuso horário consistente

            _context.Corridas.Add(corrida);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCorridaById), new { id = corrida.Id }, corrida);
        }

        // READ (All): GET /api/Corridas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Corrida>>> GetCorridas()
        {
            // Ordena da mais recente para a mais antiga
            var corridas = await _context.Corridas.OrderByDescending(c => c.Data).ToListAsync();
            return Ok(corridas);
        }

        // READ (One): GET /api/Corridas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Corrida>> GetCorridaById(int id)
        {
            var corrida = await _context.Corridas.FindAsync(id);

            if (corrida == null)
            {
                return NotFound(); // Retorna 404
            }

            return Ok(corrida);
        }

        // UPDATE: PUT /api/Corridas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCorrida(int id, Corrida corrida)
        {
            if (id != corrida.Id)
            {
                return BadRequest("IDs não coincidem.");
            }

            if (corrida.DistanciaKm <= 0 || corrida.TempoMinutos <= 0)
            {
                return BadRequest("Distância e Tempo devem ser valores positivos.");
            }
            
            corrida.Data = corrida.Data.ToUniversalTime();
            _context.Entry(corrida).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Corridas.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // Retorna 204 (Sucesso, sem corpo)
        }

        // DELETE: DELETE /api/Corridas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCorrida(int id)
        {
            var corrida = await _context.Corridas.FindAsync(id);
            if (corrida == null)
            {
                return NotFound();
            }

            _context.Corridas.Remove(corrida);
            await _context.SaveChangesAsync();

            return NoContent(); // Retorna 204
        }
    }
}