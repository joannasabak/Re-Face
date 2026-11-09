using ReFace.Core;          // so we can use PanelMatcher
using ReFace.Core.Models;   // so we can use Panel, InventoryItem, MatchOptions...

namespace ReFace.Tests;

public class MyFirstTests   // a class that holds tests; the name is up to you
{
    [Fact]                  // ← this marks the method below as a test
    public void Same_size_frame_is_an_exact_match()   // the name says what should happen
    {
        // 1. ARRANGE: make a tiny example
        var panels = new List<Panel> { new Panel("p1", 1200, 1500) };
        var items = new List<InventoryItem>
        {
            new InventoryItem("W1", "window", "timber", "double",
                1200, 1500, 70, 1, "A", 2010, "Test", true)
        };

        // 2. ACT: run the code you're testing
        var result = PanelMatcher.Match(panels, items, new MatchSettings());

        // 3. ASSERT: check the answer is what you expect
        Assert.Equal(MatchStatus.Exact, result.Matches[0].Status);
    }
}