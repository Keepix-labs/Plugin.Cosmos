using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Cosmos.src.Services
{
    public class LoggerService
    {
        public static void Log(string message, string type = "info")
        {
            Console.WriteLine(message);
        }
    }
}
