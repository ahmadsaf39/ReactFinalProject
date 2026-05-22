using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FinalProject.Models
{
    public class Link
    {
        public int Id { get; set; }

        [Required]
        public int SourceNodeId { get; set; }

        [JsonIgnore]
        public Node? SourceNode { get; set; }

        [Required]
        public int DestinationNodeId { get; set; }

        [JsonIgnore]
        public Node? DestinationNode { get; set; }

        // Cost = physical distance between nodes, in METERS.
        // Used as edge weight by Dijkstra in DijkstraService.
        [Range(1, 1000, ErrorMessage = "Distance must be between 1 and 1000 meters")]
        public int Cost { get; set; }

        public bool IsActive { get; set; } = true;
    }
}