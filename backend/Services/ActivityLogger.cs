namespace FinalProject.Services
{
    /// <summary>
    /// Thread-safe activity logger that writes structured log entries to a local file.
    /// Logs are stored at: Logs/activity.log (relative to the application root).
    /// </summary>
    public class ActivityLogger
    {
        private readonly string _logFilePath;
        private readonly object _lock = new object();

        public ActivityLogger()
        {
            var logsDir = Path.Combine(AppContext.BaseDirectory, "Logs");
            Directory.CreateDirectory(logsDir); // Create if not exists
            _logFilePath = Path.Combine(logsDir, "activity.log");
        }

        // ─── Public logging methods ───────────────────────────────────────────────

        public void LogInfo(string user, string action, string details)
            => Write("INFO", user, action, details);

        public void LogWarning(string user, string action, string details)
            => Write("WARN", user, action, details);

        public void LogError(string user, string action, string details, Exception? ex = null)
        {
            var msg = ex != null ? $"{details} | Exception: {ex.Message}" : details;
            Write("ERROR", user, action, msg);
        }

        // ─── Request / response logging (called by middleware) ────────────────────

        public void LogRequest(string user, string method, string path, string ip, int statusCode, double elapsedMs)
        {
            var level = statusCode >= 500 ? "ERROR"
                       : statusCode >= 400 ? "WARN"
                       : "INFO";

            var line = $"[{Timestamp()}] [{level}]  [HTTP]  {method} {path} → {statusCode}  ({elapsedMs:F1} ms)  user={user}  ip={ip}";
            WriteLine(line);
        }

        // ─── Private helpers ──────────────────────────────────────────────────────

        private void Write(string level, string user, string action, string details)
        {
            var line = $"[{Timestamp()}] [{level,-5}]  [user={user}]  [{action}]  {details}";
            WriteLine(line);
        }

        private void WriteLine(string line)
        {
            lock (_lock)
            {
                try
                {
                    File.AppendAllText(_logFilePath, line + Environment.NewLine);
                }
                catch
                {
                    // Silently swallow IO errors so the app never crashes due to logging
                }
            }
        }

        private static string Timestamp()
            => DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    }
}
