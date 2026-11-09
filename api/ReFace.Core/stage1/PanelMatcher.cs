using ReFace.Core.Models;

public static class PanelMatcher
{
    public static MatchResults Match(List<Panel> panels, List<InventoryItem> items, MatchSettings settings)
    {   
        //count available frames
        var stock = new Dictionary<string, int>();
        foreach (var item in items)
        {
            if (item.Available && item.Quantity > 0)
            {
                stock[item.Id] = item.Quantity;
            }
        }

        var matches = new List<PanelMatch>();
        foreach (var panel in panels)
        {
            matches.Add(FindFrame(panel, items, stock, settings));
        }
        return new MatchResults(matches, Summarise(matches));
    }

    //find a matching frame and use it
    private static PanelMatch FindFrame(Panel panel, List<InventoryItem> items, Dictionary<string, int> stock, MatchSettings settings)
    {
        foreach (var item in items)
        {
            //skips unavailable/used items
            if (!stock.ContainsKey(item.Id) || stock[item.Id] == 0)
            {
                continue;
            }

            //availble but doesnt fit
            var fit = CheckFit(item, panel, settings);
            if (fit is null)
            {
                continue;
            }

            //fit
            stock[item.Id]--;
            var status = IsExact(fit, settings) ? MatchStatus.Exact : MatchStatus.Adapted;
            return new PanelMatch(panel.Id, status, item.Id, fit.WidthGap, fit.HeightGap, fit.Rotated);
        }

        //no match
        return new PanelMatch(panel.Id, MatchStatus.Missing, null, 0, 0, false);
    }

    //rules for fitting frame as a panel
    private static FrameFit? CheckFit(InventoryItem item, Panel panel, MatchSettings settings)
    {
        var widthGap = panel.Width - item.Width;
        var heightGap = panel.Height - item.Height;

        //gap must be at least zero or the frame is too big
        var fits = widthGap >= 0 && heightGap >= 0
            //if it doesn't match tolerance it is too small
            && widthGap <= settings.Tolerance && heightGap <= settings.Tolerance;

        return fits ? new FrameFit(widthGap, heightGap, Rotated: false) : null;
    }

    private record FrameFit(double WidthGap, double HeightGap, bool Rotated);

    private static bool IsExact(FrameFit fit, MatchSettings settings)
    {
        return fit.WidthGap <= settings.ExactTolerance && fit.HeightGap <= settings.ExactTolerance;
    }

    private static MatchSummary Summarise(List<PanelMatch> matches)
    {
        var framesUsed = new Dictionary<string, int>();
        foreach (var match in matches)
        {
            if (match.ItemId is null)
            {
                continue;
            }
            framesUsed[match.ItemId] = framesUsed.GetValueOrDefault(match.ItemId) + 1;
        }

        return new MatchSummary(
            Total: matches.Count,
            Exact: matches.Count(match => match.Status == MatchStatus.Exact),
            Adapted: matches.Count(match => match.Status == MatchStatus.Adapted),
            Missing: matches.Count(match => match.Status == MatchStatus.Missing),
            FramesUsed: framesUsed);
    }

}