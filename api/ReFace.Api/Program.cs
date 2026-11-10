using System.Text.Json;
using System.Text.Json.Serialization;
using ReFace.Api;
using ReFace.Api.Data;
using ReFace.Core;
using ReFace.Core.Models;

var builder = WebApplication.CreateBuilder(args);


builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

var inventoryPath = Path.Combine(builder.Environment.ContentRootPath, "Data", "inventory.json");
builder.Services.AddSingleton<IInventoryPlaceholder>(new JsonInventory(inventoryPath));

//let the React app call this API from the browser
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
var isDevelopment = builder.Environment.IsDevelopment();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin => IsOriginAllowed(origin, allowedOrigins, isDevelopment));
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors();

//endpoints
app.MapGet("/", () => "Re-Face API is running");

//the whole inventory
app.MapGet("/inventory", (IInventoryPlaceholder inventory) =>
{
    return inventory.GetAll();
});

app.MapGet("/inventory/{id}", (string id, IInventoryPlaceholder inventory) =>
{
    var item = inventory.Find(id);
    if (item is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(item);
});

//match facade panels against the inventory
app.MapPost("/match", (MatchRequest request, IInventoryPlaceholder inventory) =>
{
    var settings = request.Settings ?? new MatchSettings();

    var problem = Validate(request, settings);
    if (problem is not null)
    {
        return Results.BadRequest(new { error = problem });
    }

    var items = inventory.GetAll().Items;
    var results = PanelMatcher.Match(request.Panels, items, settings);
    return Results.Ok(results);
});

app.Run();



//checks a /match request: returns a message about the first problem, or null if it's fine
static string? Validate(MatchRequest request, MatchSettings settings)
{
    if (request.Panels is null || request.Panels.Count == 0)
    {
        return "Send at least one panel.";
    }

    var seenIds = new HashSet<string>();
    foreach (var panel in request.Panels)
    {
        if (string.IsNullOrWhiteSpace(panel.Id))
        {
            return "Every panel needs an id.";
        }

        if (!seenIds.Add(panel.Id))
        {
            return "Panel ids must be unique, " + panel.Id + " appears twice.";
        }

        if (panel.Width <= 0 || panel.Height <= 0)
        {
            return "Panel " + panel.Id + " needs a width and height above 0.";
        }
    }

    if (settings.Tolerance < 0 || settings.ExactTolerance < 0)
    {
        return "Tolerances can't be negative.";
    }

    return null;
}

static bool IsOriginAllowed(string origin, string[] allowedOrigins, bool isDevelopment)
{
    //addresses listed in appsettings.json are always allowed
    if (allowedOrigins.Contains(origin))
    {
        return true;
    }

    //while developing, any port is allowed
    if (isDevelopment)
    {
        var isValidAddress = Uri.TryCreate(origin, UriKind.Absolute, out var uri);
        if (isValidAddress && uri!.IsLoopback)
        {
            return true;
        }
    }

    return false;
}