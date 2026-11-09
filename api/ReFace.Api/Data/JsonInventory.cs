using System.Text.Json;
using ReFace.Core.Models;

namespace ReFace.Api.Data;

public class JsonInventory : IInventoryPlaceholder
{
    private readonly InventoryData _data;

    public JsonInventory(string filePath)
    {
        var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

        var text = File.ReadAllText(filePath);
        var data = JsonSerializer.Deserialize<InventoryData>(text, jsonOptions);

        if (data is null)
        {
            throw new InvalidOperationException("Could not read the inventory from " + filePath);
        }

        _data = data;
    }

    public InventoryData GetAll()
    {
        return _data;
    }

    public InventoryItem? Find(string id)
    {
        foreach (var item in _data.Items)
        {
            if (item.Id.Equals(id, StringComparison.OrdinalIgnoreCase))
            {
                return item;
            }
        }

        return null;
    }
}