using Microsoft.EntityFrameworkCore;

namespace MotosApi
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Esta es la tabla que se creará en PostgreSQL
        public DbSet<Moto> Motos { get; set; }
    }
}