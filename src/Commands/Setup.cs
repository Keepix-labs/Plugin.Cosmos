using Keepix.PluginSystem;
using Plugin.Cosmos.src;
using Plugin.Cosmos.src.DTO;
using Plugin.Cosmos.src.Services;
using System.Diagnostics;

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


            await ProcessService.ExecuteCommand("docker", "compose up -d", workingDirectory: SetupService.GetTmpAbsolutePath(Configurations.GAIA_FOLDER_NAME),
            execute: async (Process process) =>
            {
                while (!await SetupService.IsContainnerRunning())
                {
                    LoggerService.Log("Waiting for the container to start");
                    await Task.Delay(1000);
                }
                process.Kill();
                return "";
            });

            stateManager.DB.Store("STATE", PluginStateEnum.SETUP_NODE);
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

        [KeepixPluginFn("uninstall")]
        public static async Task<bool> OnUInstall()
        {
            var allRulesPassed = await SetupService.ApplyRules(SetupService.IsDockerRunning);
            if (!allRulesPassed)
            {
                return false;
            }

            stateManager = PluginStateManager.GetStateManager();

            try
            {
                await ProcessService.ExecuteCommand("docker", "stop cosmos");
                await ProcessService.ExecuteCommand("docker", "rm cosmos");
                Thread.Sleep(1000);

                await ProcessService.ExecuteCommand("docker", "rmi cosmos:latest");

                Thread.Sleep(1000);
                await ProcessService.ExecuteCommand("docker", "volume rm gaiad-data");
                stateManager.DB.Store("STATE", PluginStateEnum.NO_STATE);

                stateManager.DB.UnStore("WalletAddress");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }

        }

    }
}
