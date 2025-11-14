using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CorridaApi.Data;
using CorridaApi.Models;
using Microsoft.AspNetCore.Authorization; // <-- OBRIGATÓRIO
using System.Security.Claims; // <-- OBRIGATÓRIO

namespace CorridaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // <-- TRANCADO! Só utilizadores logados podem aceder.
    public class CorridasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly int _userId; // ID do utilizador logado

        public CorridasController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            
            // Obtém o ID do utilizador a partir do Cookie (Claim)
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            _userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        // GET: api/Corridas
        // (Devolve apenas as corridas DO UTILIZADOR LOGADO)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Corrida>>> GetCorridas()
        {
            if (_userId == 0) return Unauthorized(); // Segurança extra

            return await _context.tb_corridas
                .Where(c => c.UsuarioId == _userId) // <-- FILTRO DE SEGURANÇA
                .OrderByDescending(c => c.Data)
                .ToListAsync();
        }

        // GET: api/Corridas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Corrida>> GetCorrida(int id)
        {
            if (_userId == 0) return Unauthorized();

            var corrida = await _context.tb_corridas
                .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == _userId); // <-- FILTRO DE SEGURANÇA

            if (corrida == null)
            {
                return NotFound("Corrida não encontrada ou não pertence a este utilizador.");
            }

            return corrida;
        }

        // POST: api/Corridas
        // (Cria uma corrida E atribui-a ao utilizador logado)
        [HttpPost]
        public async Task<ActionResult<Corrida>> PostCorrida(Corrida corrida)
        {
            if (_userId == 0) return Unauthorized();

            // Validação de segurança (regra de negócio)
            if (corrida.DistanciaKm <= 0 || corrida.TempoMinutos <= 0)
            {
                return BadRequest("Distância e Tempo devem ser maiores que zero.");
            }

            // "Carimba" a corrida com o ID do utilizador logado
            corrida.UsuarioId = _userId; 

            _context.tb_corridas.Add(corrida);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCorrida), new { id = corrida.Id }, corrida);
        }

        // PUT: api/Corridas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCorrida(int id, Corrida corrida)
        {
            if (id != corrida.Id)
            {
                return BadRequest("IDs não correspondem.");
            }
            if (_userId == 0) return Unauthorized();

            // Verifica se o utilizador é "dono" desta corrida
            var corridaExistente = await _context.tb_corridas
                .AsNoTracking() // Importante para o Update
                .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == _userId);

            if (corridaExistente == null)
            {
                return NotFound("Corrida não encontrada ou não pertence a este utilizador.");
            }
            
            // Garante que o UsuarioId não é modificado
            corrida.UsuarioId = _userId; 

            _context.Entry(corrida).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.tb_corridas.AnyAsync(c => c.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // Sucesso (sem conteúdo)
        }

        // DELETE: api/Corridas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCorrida(int id)
        {
            if (_userId == 0) return Unauthorized();

            // Verifica se o utilizador é "dono" desta corrida
            var corrida = await _context.tb_corridas
                .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == _userId);

            if (corrida == null)
            {
                return NotFound("Corrida não encontrada ou não pertence a este utilizador.");
            }

            _context.tb_corridas.Remove(corrida);
            await _context.SaveChangesAsync();

            return NoContent(); // Sucesso (sem conteúdo)
        }
    }
}