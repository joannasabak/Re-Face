namespace ReFace.Core.Models;

public enum MatchStatus
{
    Exact,
    Adapted,
    Missing,
}

public record PanelMatch(
    string PanelId,
    MatchStatus Status,
    string? ItemId,
    double WidthGap,
    double HeightGap,
    bool Rotated
);

public record MatchSummary(
    int Total,
    int Exact,
    int Adapted,
    int Missing,
    Dictionary<string, int> FramesUsed
);

public record MatchResults(List<PanelMatch> Matches, MatchSummary Summary);