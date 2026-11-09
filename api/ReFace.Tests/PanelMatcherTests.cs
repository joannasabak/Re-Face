using ReFace.Core;
using ReFace.Core.Models;

namespace ReFace.Tests;

public class PanelMatcherTests
{
    private static InventoryItem Frame(string id, int width, int height, int quantity = 1, string condition = "A", bool available = true)
    {
        return new InventoryItem(id, "window", "timber", "double", width, height, 70, quantity, condition, 2010, "Test", available);
    }

    private static readonly MatchSettings Rules = new();

    [Fact]
    public void Same_size_frame_is_an_exact_match()
    {
        var panels = new List<Panel> { new("p1", 1200, 1500) };
        var items = new List<InventoryItem> { Frame("W1", 1200, 1500) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(MatchStatus.Exact, result.Matches[0].Status);
        Assert.Equal("W1", result.Matches[0].ItemId);
    }

    [Fact]
    public void Slightly_smaller_frame_is_adapted()
    {
        var panels = new List<Panel> { new("p1", 1230, 1520) };
        var items = new List<InventoryItem> { Frame("W1", 1200, 1500) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(MatchStatus.Adapted, result.Matches[0].Status);
        Assert.Equal(30, result.Matches[0].WidthGap);
        Assert.Equal(20, result.Matches[0].HeightGap);
    }

    [Fact]
    public void Frame_too_small_or_too_big_is_missing()
    {
        var panels = new List<Panel>
        {
            new("tooSmall", 1300, 1500), // frame would be 100 mm narrower: more than the 50 mm allowed
            new("tooBig", 1100, 1500),   // frame is wider than the panel
        };
        var items = new List<InventoryItem> { Frame("W1", 1200, 1500, quantity: 5) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(MatchStatus.Missing, result.Matches[0].Status);
        Assert.Equal(MatchStatus.Missing, result.Matches[1].Status);
        Assert.Null(result.Matches[0].ItemId);
    }

    [Fact]
    public void Quantity_limits_how_many_panels_get_a_frame()
    {
        var panels = new List<Panel> { new("p1", 1200, 1500), new("p2", 1200, 1500), new("p3", 1200, 1500) };
        var items = new List<InventoryItem> { Frame("W1", 1200, 1500, quantity: 2) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(2, result.Summary.Exact);
        Assert.Equal(1, result.Summary.Missing);
        Assert.Equal(2, result.Summary.FramesUsed["W1"]);
    }

    [Fact]
    public void Unavailable_frames_are_never_used()
    {
        var panels = new List<Panel> { new("p1", 1200, 1500) };
        var items = new List<InventoryItem> { Frame("W1", 1200, 1500, available: false) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(MatchStatus.Missing, result.Matches[0].Status);
    }

    [Fact]
    public void Results_come_back_in_panel_order_with_correct_totals()
    {
        var panels = new List<Panel> { new("a", 1200, 1500), new("b", 999, 999), new("c", 1220, 1500) };
        var items = new List<InventoryItem> { Frame("W1", 1200, 1500, quantity: 5) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal("a", result.Matches[0].PanelId);
        Assert.Equal("b", result.Matches[1].PanelId);
        Assert.Equal("c", result.Matches[2].PanelId);
        Assert.Equal(3, result.Summary.Total);
        Assert.Equal(1, result.Summary.Exact);   // a
        Assert.Equal(1, result.Summary.Missing); // b
        Assert.Equal(1, result.Summary.Adapted); // c
    }
}
