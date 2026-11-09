using ReFace.Core.Models;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapGet("/example", () => new Panel("p1", 1200, 1500));

app.Run();