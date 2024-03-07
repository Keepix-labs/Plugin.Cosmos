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
                LocallatestBlockHeight = containerStatus?["SyncInfo"]?["latest_block_height"].Value<int>(),
                ServerLatestBlockHeight = await FetchLatestBlockAsync(),
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


        public static async Task<string> FetchLatestBlockAsync()
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    string baseUrl = "https://cosmos-rpc.polkachu.com/status";
                    HttpResponseMessage response = await client.GetAsync(baseUrl);
                    response.EnsureSuccessStatusCode();
                    var status = await response.Content.ReadAsStringAsync();
                    JObject json = JObject.Parse(status);
                    return json["result"]["sync_info"]["latest_block_height"].Value<string>();
                }

            }
            catch
            {
                return "0";
            }
        }

    }
}