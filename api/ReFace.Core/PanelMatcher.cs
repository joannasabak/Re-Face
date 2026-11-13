using ReFace.Core.Models;


namespace ReFace.Core;

public static class PanelMatcher
{
    //pick a frame in better cond if similar fit
    private static readonly Dictionary<string, int> ConditionRank = new() { ["A"] = 0, ["B"] = 1, ["C"] = 2 };

    public static MatchResults Match(List<Panel> panels, List<InventoryItem> items, MatchSettings settings)
    {
        //unique id for panels
        if (panels.Select(panel => panel.Id).Distinct().Count() != panels.Count)
        {
            throw new ArgumentException("Every panel needs a unique id.");
        }

        //count available frames
        var stock = new Dictionary<string, int>();
        foreach (var item in items)
        {
            if (item.Available && item.Quantity > 0)
            {
                stock[item.Id] = item.Quantity;
            }
        }

        //panel order
        //if one can has a single position it's chosen firts 
        //panels still waiting for a frame
        //each round the panel with the fewest options left goes next
        var remaining = new List<Panel>(panels);

        var resultsById = new Dictionary<string, PanelMatch>();
        while (remaining.Count > 0)
        {
            var index = MostConstrained(remaining, items, stock, settings);
            var panel = remaining[index];
            remaining.RemoveAt(index);

            resultsById[panel.Id] = FindBestFrame(panel, items, stock, settings);
        }

        var matches = new List<PanelMatch>();
        foreach (var panel in panels)
        {
            matches.Add(resultsById[panel.Id]);
        }

        return new MatchResults(matches, Summarise(matches));
    }

    //how many item options for each panel
    private static int CountPossibleItems(Panel panel, List<InventoryItem> items, Dictionary<string, int> stock, MatchSettings settings)
    {
        var count = 0;
        foreach (var item in items)
        {
            if (stock.GetValueOrDefault(item.Id) > 0 && CheckFit(item, panel, settings) is not null)
            {
                count++;
            }
        }
        return count;
    }

    //index of the panel with the fewest frames left that fit it
    private static int MostConstrained(List<Panel> remaining, List<InventoryItem> items, Dictionary<string, int> stock, MatchSettings settings)
    {
        var bestIndex = 0;
        var bestCount = int.MaxValue;

        for (var i = 0; i < remaining.Count; i++)
        {
            var panel = remaining[i];
            var best = remaining[bestIndex];
            var count = CountPossibleItems(panel, items, stock, settings);

            var fewerOptions = count < bestCount;
            var sameButLarger = count == bestCount && panel.Width * panel.Height > best.Width * best.Height;
            if (fewerOptions || sameButLarger)
            {
                bestIndex = i;
                bestCount = count;
            }
        }

        return bestIndex;
    }

    //find a matching frame and use it
    private static PanelMatch FindBestFrame(Panel panel, List<InventoryItem> items, Dictionary<string, int> stock, MatchSettings settings)
    {
        InventoryItem? bestItem = null;
        FrameFit? bestFit = null;

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

            if (bestItem is null || bestFit is null || IsBetter(item, fit, bestItem, bestFit))
            {
                bestItem = item;
                bestFit = fit;
            }
        }

        //no frame fits
        if (bestItem is null || bestFit is null)
        {
            return new PanelMatch(panel.Id, MatchStatus.Missing, null, 0, 0, false);
        }

        //fit: use one frame of the best item
        stock[bestItem.Id]--;
        var status = IsExact(bestFit, settings) ? MatchStatus.Exact : MatchStatus.Adapted;
        return new PanelMatch(panel.Id, status, bestItem.Id, bestFit.WidthGap, bestFit.HeightGap, bestFit.Rotated);
    }

    //rules to prioritize
    //smaller total gap, condition, id
    private static bool IsBetter(InventoryItem itemA, FrameFit fitA, InventoryItem itemB, FrameFit fitB)
    {
        var gapA = fitA.WidthGap + fitA.HeightGap;
        var gapB = fitB.WidthGap + fitB.HeightGap;
        if (gapA != gapB)
        {
            return gapA < gapB;
        }

        var conditionA = ConditionRank.GetValueOrDefault(itemA.Condition, 9);
        var conditionB = ConditionRank.GetValueOrDefault(itemB.Condition, 9);
        if (conditionA != conditionB)
        {
            return conditionA < conditionB;
        }

        return string.CompareOrdinal(itemA.Id, itemB.Id) < 0;
    }

    //rules for fitting frame as a panel rotated or not
    private static FrameFit? CheckFit(InventoryItem item, Panel panel, MatchSettings settings)
    {
        if (FitsNoRotation(item.Width, item.Height, panel, settings))
        {
            return new FrameFit(panel.Width - item.Width, panel.Height - item.Height, Rotated: false);
        }

        if (settings.AllowRotation && FitsNoRotation(item.Height, item.Width, panel, settings))
        {
            return new FrameFit(panel.Width - item.Height, panel.Height - item.Width, Rotated: true);
        }

        return null;
    }
    private static bool FitsNoRotation(double frameWidth, double frameHeight, Panel panel, MatchSettings settings)
    {
        var widthGap = panel.Width - frameWidth;
        var heightGap = panel.Height - frameHeight;

        return widthGap >= 0 && heightGap >= 0
            && widthGap <= settings.Tolerance && heightGap <= settings.Tolerance;
    }

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

    //how does it fit (gaps, rot)
    private record FrameFit(double WidthGap, double HeightGap, bool Rotated);
}
