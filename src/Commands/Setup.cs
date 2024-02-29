using Keepix.PluginSystem;
using Plugin.Cosmos.src;
using Plugin.Cosmos.src.DTO;
using Plugin.Cosmos.src.Services;

namespace Plugin.Cosmos.Commands
{
    public class Setup
    {
        private static PluginStateManager stateManager;

        [KeepixPluginFn("install")]
        public static async Task<bool> OnInstall(WalletInput input)
        {
            var allRulesPassed = await SetupService.ApplyRules(SetupService.IsDockerRunning, SetupService.IsNotContainnerRunning,
                async () => { return true; });
            if (!allRulesPassed)
            {
                return false;
            }

            stateManager = PluginStateManager.GetStateManager();
            stateManager.DB.Store("STATE", PluginStateEnum.STARTING_INSTALLATION);
            var gaiaSource = await SetupService.DownloadGaiaSource(Configurations.GAIA_SOURCE, SetupService.GetTmpAbsolutePath("gaia.zip"));
            if (!gaiaSource)
            {
                LoggerService.Log("Downloaded of the gaia failed");
                return false;
            }
            var gaiaUnzip = await SetupService.UnzipGaiaSource(SetupService.GetTmpAbsolutePath("gaia.zip"), SetupService.GetTmpAbsolutePath(""));
            if (!gaiaUnzip)
            {
                LoggerService.Log("Unzipping of the gaia failed");
                return false;
            }

            var gaiaBuildFiles = await SetupService.CopyBuildGaiaFiles(SetupService.GetTmpAbsolutePath(Configurations.GAIA_FOLDER_NAME));
            if (!gaiaBuildFiles)
            {
                LoggerService.Log("Copying of the gaia files failed");
                return false;
            }

            var snapshotUrl = SetupService.GetSnapshotUrl("https://services.lavenderfive.com/mainnet/cosmoshub/snapshot");
            if (snapshotUrl == string.Empty)
            {
                LoggerService.Log("Failed to get the snapshotUrl");
                return false;
            }
            var gaiaScriptTmpFile = Path.Combine(SetupService.GetTmpAbsolutePath(Configurations.GAIA_FOLDER_NAME), "start-gaiad.sh");
            var rebuildGaiaScript = SetupService.PrependToScript(gaiaScriptTmpFile, snapshotUrl);
            if (!rebuildGaiaScript)
            {
                LoggerService.Log("Failed to rebuild the gaia script");
                return false;
            }

            stateManager.DB.Store("STATE", PluginStateEnum.STARTING_NODE);

            await ProcessService.ExecuteCommand("docker", "compose up -d", workingDirectory: SetupService.GetTmpAbsolutePath(Configurations.GAIA_FOLDER_NAME));

            return true;
        }

        [KeepixPluginFn("start")]
        public static async Task<bool> OnStartFunc()
        {
            var allRulesPassed = await SetupService.ApplyRules(SetupService.IsDockerRunning, SetupService.IsNotContainnerRunning);
            if (!allRulesPassed)
            {
                return false;
            }

            try
            {
                stateManager = PluginStateManager.GetStateManager();

                stateManager.DB.Store("STATE", PluginStateEnum.NODE_RUNNING);
                await ProcessService.ExecuteCommand("docker", "restart cosmos");
                return true;

            }
            catch
            {
                return false;
            }

        }

        [KeepixPluginFn("stop")]
        public static async Task<bool> OnStoptFunc()
        {
            var allRulesPassed = await SetupService.ApplyRules(SetupService.IsDockerRunning, SetupService.IsNotContainnerRunning);
            if (!allRulesPassed)
            {
                return false;
            }

            try
            {
                stateManager = PluginStateManager.GetStateManager();
                await Plugin.Cosmos.src.Services.ProcessService.ExecuteCommand("docker", "stop cosmos");
                stateManager.DB.Store("STATE", PluginStateEnum.NODE_STOPPED);
                return true;

            }
            catch
            {
                return false;
            }

        }

        [KeepixPluginFn("test")]
        public static async Task<bool> test()
        {
            return true;
        }


    }
}
