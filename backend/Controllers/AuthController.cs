using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CorridaApi.Data;
using CorridaApi.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.ComponentModel.DataAnnotations;

namespace CorridaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // DTO (Data Transfer Object) para o Registo/Login
        public class AuthRequest
        {
            [Required]
            [MinLength(4)]
            public string NomeUsuario { get; set; } = string.Empty;

            [Required]
            [MinLength(4)]
            public string Senha { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRequest request)
        {
            // 1. Validar se o utilizador já existe
            if (await _context.tb_usuarios.AnyAsync(u => u.NomeUsuario == request.NomeUsuario))
            {
                return BadRequest("O nome de utilizador já existe.");
            }

            // 2. Encriptar (Hash) a Senha
            string senhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);

            // 3. Criar o novo utilizador
            var novoUsuario = new Usuario
            {
                NomeUsuario = request.NomeUsuario,
                SenhaHash = senhaHash
            };

            // 4. Salvar na base de dados
            _context.tb_usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            // --- CORREÇÃO (INÍCIO) ---
            // 5. Fazer o Login (Criar o Cookie) IMEDIATAMENTE após o registo

            // Criar a "Identidade" (Claims) para o novo utilizador
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, novoUsuario.NomeUsuario),
                new Claim(ClaimTypes.NameIdentifier, novoUsuario.Id.ToString()) // O ID do novo utilizador
            };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            // Criar o Cookie de Autenticação
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity));
            
            // --- CORREÇÃO (FIM) ---

            return Ok(new { message = "Utilizador registado e logado com sucesso." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            var usuario = await _context.tb_usuarios
                .FirstOrDefaultAsync(u => u.NomeUsuario == request.NomeUsuario);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            {
                return Unauthorized("Nome de utilizador ou senha inválidos.");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, usuario.NomeUsuario),
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity));

            return Ok(new { message = $"Login bem-sucedido. Bem-vindo, {usuario.NomeUsuario}." });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logout bem-sucedido." });
        }
        
        // CORREÇÃO (Aviso CS1998): O método agora é síncrono
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return Ok(new { nomeUsuario = User.Identity.Name });
            }
            return Unauthorized();
        }
    }
}