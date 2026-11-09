namespace ReFace.Core.Models;

public record InventoryItem(
    string Id,
    string Type,
    string FrameMaterial,
    string Glazing,
    int Width,
    int Height,
    int Depth,
    int Quantity,
    string Condition,
    int YearMade,
    string Source,
    bool Available
);

public record InventoryData(
    string Description,
    Dictionary<string, string> Units,
    Dictionary<string, string> ConditionGrades,
    List<InventoryItem> Items
);
