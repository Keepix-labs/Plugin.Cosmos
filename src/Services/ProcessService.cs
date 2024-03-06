using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace Plugin.Cosmos.src.Services
{
    public class ProcessService
    {
        public static async Task<string> ExecuteCommand(string command, string arguments, Func<Process, Task<string>> execute = null,
        Dictionary<string, string> envVars = null, string workingDirectory = null)
        {
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = command,
                    Arguments = arguments,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                };

                if (!string.IsNullOrEmpty(workingDirectory))
                {
                    startInfo.WorkingDirectory = workingDirectory;
                }

                startInfo.RedirectStandardError = true;

                if (envVars != null)
                {
                    foreach (var envVar in envVars)
                    {
                        startInfo.EnvironmentVariables[envVar.Key] = envVar.Value;
                    }
                }

                using (Process process = new Process { StartInfo = startInfo })
                {
                    process.Start();
                    if (execute == null)
                    {
                        string result = await process.StandardOutput.ReadToEndAsync();
                        string error = await process.StandardError.ReadToEndAsync();

                        process.WaitForExit();
                        return result + error;
                    }
                    else
                    {
                        return await execute(process);
                    }
                }
            }
            catch (Exception ex)
            {
                LoggerService.Log(ex.Message, "error");
                throw ex;
            }

        }
    }
}
