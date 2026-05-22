namespace FinalProject.Graph
{
    public class Graph
    {
        public Dictionary<int, List<GraphEdge>> AdjacencyList { get; set; }
            = new Dictionary<int, List<GraphEdge>>();
    }
}