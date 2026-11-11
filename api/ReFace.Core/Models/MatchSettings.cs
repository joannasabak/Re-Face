namespace ReFace.Core.Models;

public record MatchSettings
{
    //set tolerance for how much smaller fits
    public double Tolerance { get; init; } = 100;

    //what counts as exact match (small gaps allowed)
    public double ExactTolerance { get; init; } = 10;

    //frames can rotate to fit
    public bool AllowRotation { get; init; } = false;
}