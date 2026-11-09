using ReFace.Core.Models;

namespace ReFace.Api.Data;

//can be later swapped for a database
public interface IInventoryPlaceholder
{
    InventoryData GetAll();

    InventoryItem? Find(string id);
}