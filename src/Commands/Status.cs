using Keepix.PluginSystem;
using Newtonsoft.Json;
using Plugin.Cosmos.src.DTO;
using Plugin.Cosmos.src.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Cosmos.Commands
{
    public class Monitoring
    {

        private static PluginStateManager stateManager;

        [KeepixPluginFn("status")]
        public static async Task<string> OnStatus(WalletInput input)
        {
            stateManager = PluginStateManager.GetStateManager();
            return JsonConvert.SerializeObject(new
            {
                NodeState = stateManager.State.ToString(),
                Alive = await SetupService.IsContainnerRunning(),
            });
        }
    }
}