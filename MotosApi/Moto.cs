namespace MotosApi
{
    public class Moto
    {
        public int Id { get; set; }
        public string Marca { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public string Precio { get; set; } = string.Empty; // Añadimos el precio
    }
}