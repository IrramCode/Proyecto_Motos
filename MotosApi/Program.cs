using Microsoft.EntityFrameworkCore;
using MotosApi; // Asegúrate de que apunte a tu namespace

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configurar CORS (Ya lo tenías, mantenlo)
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// 3. Usar CORS
app.UseCors();

// ... resto del código (app.MapControllers, etc.)
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
