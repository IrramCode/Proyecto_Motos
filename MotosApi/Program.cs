using Microsoft.EntityFrameworkCore;
using MotosApi; 

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURACIÓN DE POSTGRESQL (PLAN MAESTRO) ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions => {
        // Esto le dice a tu API: "Si la BD tarda en responder, no mueras, inténtalo de nuevo 5 veces"
        npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    }));

// 2. Configurar CORS (Permite que GitHub Pages lea tu API)
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// --- 3. CREACIÓN AUTOMÁTICA DE TABLAS (Importante para Render) ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated(); 
        Console.WriteLine("Base de datos verificada/creada con éxito.");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error al crear la BD: " + ex.Message);
    }
}

// 4. Configurar el pipeline
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();