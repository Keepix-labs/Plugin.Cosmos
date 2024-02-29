
using Keepix.PluginSystem;
using Plugin.Cosmos.Commands;
using Plugin.Cosmos.src.Services;
using System.Reflection;

namespace Plugin.Cosmos
{
    public class Program
    {
        public static void Main(string[] args)
        {
            string arg = args.Count() > 0 ? args[0] : "";
            Task task = KeepixPlugin.Run(arg, Assembly.GetExecutingAssembly().GetTypes());
            task.Wait();
        }
    }
}