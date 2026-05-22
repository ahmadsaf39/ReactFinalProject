using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models
{
    public class Simulation
    {
        public int Id { get; set; }

        public int SourceNodeId { get; set; }

        public int DestinationNodeId { get; set; }

        public AlgorithmType Algorithm { get; set; }

        public double TotalCost { get; set; }

        public double ExecutionTimeMs { get; set; }

        public int VisitedNodes { get; set; }

        public int EdgeRelaxations { get; set; }

        public bool PathFound { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<SimulationPath> PathNodes { get; set; } = new List<SimulationPath>();
    }
}