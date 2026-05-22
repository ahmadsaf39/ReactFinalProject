using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FinalProject.Models
{
    public class Node
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public NodeType Type { get; set; }

        public double X { get; set; }

        public double Y { get; set; }

        public bool IsActive { get; set; } = true;

        [JsonIgnore]
        public ICollection<Link> SourceLinks { get; set; } = new List<Link>();

        [JsonIgnore]
        public ICollection<Link> DestinationLinks { get; set; } = new List<Link>();
    }
}