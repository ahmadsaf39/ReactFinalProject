using System.Text.Json.Serialization;

namespace FinalProject.Models
{
    public class SimulationPath
    {
        public int Id { get; set; }

        public int SimulationId { get; set; }

        [JsonIgnore]
        public Simulation Simulation { get; set; } = null!;

        public int NodeId { get; set; }

        public int StepOrder { get; set; }
    }
}