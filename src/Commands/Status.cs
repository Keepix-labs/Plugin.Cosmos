using Keepix.PluginSystem;
using Newtonsoft.Json;
using Plugin.Cosmos.src.DTO;
using Plugin.Cosmos.src.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Plugin.Cosmos.Commands
{
    public class Monitoring
    {

        private static PluginStateManager stateManager;

        [KeepixPluginFn("status")]
        public static async Task<string> OnStatus(WalletInput input)
        {
            stateManager = PluginStateManager.GetStateManager();
            var containerStatus = await GetContainerStatus();
            return JsonConvert.SerializeObject(new
            {
                IsSynchronizing = containerStatus?["SyncInfo"]?["catching_up"].Value<bool>(),
                NodeState = stateManager.State.ToString(),
                Alive = await SetupService.IsContainnerRunning(),
            });
        }

        public static async Task<JToken> GetContainerStatus()
        {
            try
            {
                var status = await ProcessService.ExecuteCommand("docker", "exec cosmos gaiad status");
                JObject json = JObject.Parse(status);
                return json;
            }
            catch
            {
                LoggerService.Log("Containner is not activated");
                return null;
            }
        }
    }
}