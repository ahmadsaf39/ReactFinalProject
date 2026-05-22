using FinalProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalProject.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Node> Nodes { get; set; }
        public DbSet<Link> Links { get; set; }
        public DbSet<Simulation> Simulations { get; set; }
        public DbSet<SimulationPath> SimulationPaths { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Prevent cascade delete conflicts for Link -> Node
            modelBuilder.Entity<Link>()
                .HasOne(l => l.SourceNode)
                .WithMany(n => n.SourceLinks)
                .HasForeignKey(l => l.SourceNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Link>()
                .HasOne(l => l.DestinationNode)
                .WithMany(n => n.DestinationLinks)
                .HasForeignKey(l => l.DestinationNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cascade delete: removing a Simulation removes all its SimulationPath records
            modelBuilder.Entity<SimulationPath>()
                .HasOne(sp => sp.Simulation)
                .WithMany(s => s.PathNodes)
                .HasForeignKey(sp => sp.SimulationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}