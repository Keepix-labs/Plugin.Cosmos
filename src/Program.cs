
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
            /*string arg = args.Count() > 0 ? args[0] : "";
            Task task = KeepixPlugin.Run(arg, Assembly.GetExecutingAssembly().GetTypes());
            task.Wait();*/

            var task = new Task(async () =>
            {
                await Setup.OnInstall(new src.DTO.WalletInput()
                {
                    WalletSecretKey = "test"
                });
                while (true) ;
            });
            task.Start();
            task.Wait();
            while (true) ;
        }


    }
}