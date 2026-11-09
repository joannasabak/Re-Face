using ReFace.Core.Models;

namespace ReFace.Api;

public record MatchRequest(List<Panel> Panels, MatchSettings? Settings);
