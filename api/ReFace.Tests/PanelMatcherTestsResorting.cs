using ReFace.Core;
using ReFace.Core.Models;

namespace ReFace.Tests;

//tests for re-sorting: after every match the matcher recounts each waiting panel's options
//so a panel that has just lost a frame to someone else moves up the queue.
public class PanelMatcherResortTests
{
    private static InventoryItem Frame(string id, int width, int height, int quantity = 1)
    {
        return new InventoryItem(id, "window", "timber", "double", width, height, 70, quantity, "A", 2010, "Test", true);
    }

    private static readonly MatchSettings Rules = new();

    [Fact]
    public void Panel_that_loses_an_option_moves_up_the_queue()
    {
        // At the start: P1 fits only F1. P0 fits F0 and F2. P2 fits F0 and F1.
        // P1 goes first and takes F1, which leaves P2 with a single option (F0).
        // Sorted only once, P0 (the larger panel) would go next, take F0, and leave P2 with nothing.
        var panels = new List<Panel> { new("P0", 1060, 2010), new("P1", 910, 2080), new("P2", 990, 2090) };
        var items = new List<InventoryItem> { Frame("F0", 980, 1990), Frame("F1", 900, 2070), Frame("F2", 1040, 1910) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(0, result.Summary.Missing);
        Assert.Equal("F2", result.Matches[0].ItemId); // P0
        Assert.Equal("F1", result.Matches[1].ItemId); // P1
        Assert.Equal("F0", result.Matches[2].ItemId); // P2
    }

    [Fact]
    public void Options_are_recounted_when_a_frame_type_runs_out()
    {
        // Same idea with stock: F1 has two frames and two panels that fit nothing else.
        // P2 still counts F1 as an option until the second one is used; only then is it down to F0.
        var panels = new List<Panel>
        {
            new("P0", 1060, 2010),
            new("P1a", 910, 2080),
            new("P1b", 910, 2080),
            new("P2", 990, 2090),
        };
        var items = new List<InventoryItem> { Frame("F0", 980, 1990), Frame("F1", 900, 2070, quantity: 2), Frame("F2", 1040, 1910) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(0, result.Summary.Missing);
        Assert.Equal(2, result.Summary.FramesUsed["F1"]);
        Assert.Equal("F0", result.Matches[3].ItemId); // P2
    }

    [Fact]
    public void Larger_panel_goes_first_when_options_are_tied()
    {
        // Both panels fit only the one frame. The tie goes to the larger panel.
        var panels = new List<Panel> { new("small", 1010, 2010), new("big", 1050, 2050) };
        var items = new List<InventoryItem> { Frame("F", 1000, 2000) };

        var result = PanelMatcher.Match(panels, items, Rules);

        Assert.Equal(MatchStatus.Missing, result.Matches[0].Status); // small
        Assert.Equal("F", result.Matches[1].ItemId);                 // big
    }
}