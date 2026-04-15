using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MotosApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MotosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MotosController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LISTAR: Obtener todas las motos (Usado por cargarMotos)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Moto>>> GetMotos()
        {
            return await _context.Motos.ToListAsync();
        }

        // 2. OBTENER UNA: (Usado por editarMoto para llenar el formulario)
        [HttpGet("{id}")]
        public async Task<ActionResult<Moto>> GetMoto(int id)
        {
            var moto = await _context.Motos.FindAsync(id);
            if (moto == null) return NotFound();
            return moto;
        }

        // 3. GUARDAR: Crear nueva moto (POST)
        [HttpPost]
        public async Task<ActionResult<Moto>> PostMoto(Moto moto)
        {
            _context.Motos.Add(moto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMotos), new { id = moto.Id }, moto);
        }

        // 4. ACTUALIZAR: Modificar moto existente (PUT)
        // Este es el método que te faltaba para resolver el error 405 en Postman
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMoto(int id, Moto moto)
        {
            if (id != moto.Id) return BadRequest();

            _context.Entry(moto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Motos.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 5. ELIMINAR: Borrar moto (DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMoto(int id)
        {
            var moto = await _context.Motos.FindAsync(id);
            if (moto == null) return NotFound();

            _context.Motos.Remove(moto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}