using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using Keepix.PluginSystem;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using System.Diagnostics;
using Plugin.Cosmos.src.Services;

namespace Plugin.Cosmos.src.Commands
{
    internal class StateController
    {
        private static PluginStateManager stateManager;

        [KeepixPluginFn("wallet-fetch")]
        public static async Task<string> OnWalletFetch()
        {
            stateManager = PluginStateManager.GetStateManager();
            var isDockerRunning = await SetupService.IsDockerRunning();
            var isContainerRunning = await SetupService.IsContainnerRunning();
            if (!isDockerRunning || !isContainerRunning)
            {
                string? address = stateManager.DB.Retrieve<string>("WalletAddress");
                if (!string.IsNullOrEmpty(address))
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Exists = true,
                        Wallet = address
                    });
                }

                LoggerService.Log("Docker is not live on your device, please start it");
                return JsonConvert.SerializeObject(new
                {
                    Exists = false
                });
            }

            return JsonConvert.SerializeObject(new
            {
                Exists = false,
            });
        }

    }
}