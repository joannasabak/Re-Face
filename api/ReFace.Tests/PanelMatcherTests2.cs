using ReFace.Core;
using ReFace.Core.Models;

namespace ReFace.Tests;

// Tests for choosing well, not just choosing something that fits
public class PanelMatcherSmartChoiceTests
{
    private static InventoryItem Frame(string id, int width, int height,
        int quantity = 1, string condition = "A", bool available = true)
    {
        return new InventoryItem(id, "window", "timber", "double",
            width, height, 70, quantity, condition, 2010, "Test", available);
    }

    private static readonly MatchSettings Rules = new();

    [Fact]
    public void Closest_size_wins_over_a_looser_fit()
    {
        var panels = new List<Panel> { new("p1", 1200, 1500) };
        var items = new List<InventoryItem>
        {
            Frame("loose", 1160, 1460), // fits, but leaves 40 mm gaps
            Frame("close", 1195, 1498), // fits much better
        };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal("close", result.Matches[0].ItemId);
    }

    [Fact]
    public void Better_condition_wins_when_sizes_are_equal()
    {
        var panels = new List<Panel> { new("p1", 1200, 1500) };
        var items = new List<InventoryItem>
        {
            Frame("worn", 1200, 1500, condition: "C"),
            Frame("good", 1200, 1500, condition: "A"),
        };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal("good", result.Matches[0].ItemId);
    }

    [Fact]
    public void Scarce_frames_go_to_panels_that_have_no_other_option()
    {
        // "picky" only fits the "small" frame. "flexible" fits both frames, and "small" is its
        // closest fit. If flexible chose first, it would take small and leave picky with nothing.
        var panels = new List<Panel> { new("flexible", 1250, 1550), new("picky", 1215, 1515) };
        var items = new List<InventoryItem> { Frame("small", 1212, 1512), Frame("other", 1216, 1500) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(0, result.Summary.Missing);
        Assert.Equal("other", result.Matches[0].ItemId); // flexible
        Assert.Equal("small", result.Matches[1].ItemId); // picky
    }

    [Fact]
    public void Rotation_is_only_used_when_allowed()
    {
        var panels = new List<Panel> { new("landscape", 1500, 1200) };
        var items = new List<InventoryItem> { Frame("portrait", 1200, 1500) };

        var withoutRotation = PanelMatcher.Match(panels, items, Rules);
        var withRotation = PanelMatcher.Match(panels, items, Rules with { AllowRotation = true });

        Assert.Equal(MatchStatus.Missing, withoutRotation.Matches[0].Status);
        Assert.Equal(MatchStatus.Exact, withRotation.Matches[0].Status);
        Assert.True(withRotation.Matches[0].Rotated);
    }

    [Fact]
    public void Duplicate_panel_ids_are_rejected()
    {
        var panels = new List<Panel> { new("p1", 1200, 1500), new("p1", 1200, 1500) };

        Assert.Throws<ArgumentException>(() => PanelMatcher.Match(panels, new List<InventoryItem>(), Rules));
    }
}