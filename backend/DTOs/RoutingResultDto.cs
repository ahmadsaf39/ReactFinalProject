namespace FinalProject.DTOs
{
    public class RoutingResultDto
    {
        public bool PathFound { get; set; }

        public List<int> PathNodeIds { get; set; } = new List<int>();

        public double TotalCost { get; set; }
        public double ExecutionTimeMs { get; set; }
        public int VisitedNodes { get; set; }
        public int EdgeRelaxations { get; set; }
        public string Algorithm { get; set; } = string.Empty;
    }
}