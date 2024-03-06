using Plugin.Cosmos.src.DTO;
using Plugin.Cosmos.src.Utils;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System.Text.RegularExpressions;

namespace Plugin.Cosmos.src.Services
{
    public class SetupService
    {

        private static PluginStateManager stateManager;
        public static async Task<bool> IsDockerRunning()
        {
            try
            {
                var res = await ProcessService.ExecuteCommand("docker", "info");
                return res != string.Empty;
            }
            catch
            {
                LoggerService.Log("Docker is not live on your device, please start it");
                return false;
            }

        }

        public static async Task<bool> IsContainnerRunning()
        {
            try
            {
                var res = await ProcessService.ExecuteCommand("docker", "ps");
                return res.Contains("cosmos");
            }
            catch
            {
                LoggerService.Log("Containner is not activated");
                return false;
            }
        }


        public static async Task<bool> IsSnapshotImportRunning()
        {
            try
            {
                var res = await ProcessService.ExecuteCommand("docker", "ps");
                return res.Contains("octez-snapshot-import");
            }
            catch
            {
                return false;
            }
        }

        public static async Task<bool> IsNotContainnerRunning()
        {
            try
            {
                var res = await ProcessService.ExecuteCommand("docker", "ps");
                return !res.Contains("octez-public-node-rolling");
            }
            catch
            {
                LoggerService.Log("Containner is already activated");
                return false;
            }
        }

        public async static Task<bool> DownloadGaiaSource(string url, string path)
        {
            using (var client = new HttpClient())
            {

                LoggerService.Log("Start downloading gaiad source");
                try
                {
                    await client.DownloadFileAsync(url, path);
                    return true;
                }
                catch (Exception ex)
                {
                    LoggerService.Log(ex.ToString());
                    return false;
                }
            }
        }

        public static string GetTmpAbsolutePath(string pathFile)
        {
            var username = Environment.UserName;
            var basePath = "";

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                string tempPath = System.IO.Path.GetTempPath();
                basePath = Path.Combine(tempPath, pathFile);
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                basePath = $"/tmp/{pathFile}";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                basePath = $"/tmp/{pathFile}";

            }

            return basePath;

        }

        public static async Task<bool> ApplyRules(params Func<Task<bool>>[] ruleFunctions)
        {
            var tasks = ruleFunctions.Select(rule => rule()).ToArray();
            await Task.WhenAll(tasks);
            return tasks.All(task => task.Result);
        }

        public static async Task<bool> UnzipGaiaSource(string source, string destination)
        {
            try
            {
                ZipFile.ExtractToDirectory(source, destination, true);
                return true;
            }
            catch (Exception ex)
            {
                LoggerService.Log(ex.ToString());
                return false;
            }
        }

        public static async Task<bool> CopyBuildGaiaFiles(string gaiaFolder)
        {
            try
            {
                File.Copy("Dockerfile", Path.Combine(gaiaFolder, "Dockerfile"), true);
                File.Copy("docker-compose.yml", Path.Combine(gaiaFolder, "docker-compose.yml"), true);
                File.Copy("start-gaiad.sh", Path.Combine(gaiaFolder, "start-gaiad.sh"), true);
                return true;
            }
            catch (Exception ex)
            {
                LoggerService.Log(ex.ToString());
                return false;
            }

        }

        public static string GetSnapshotUrl(string url)
        {


            var service = ChromeDriverService.CreateDefaultService();
            service.SuppressInitialDiagnosticInformation = true;
            service.HideCommandPromptWindow = true;


            var options = new ChromeOptions();
            options.AddArgument("--headless");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--log-level=3");

            using (IWebDriver driver = new ChromeDriver(service, options))
            {
                driver.Navigate().GoToUrl(url);
                driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);

                try
                {
                    var links = driver.FindElements(By.XPath("//a[contains(@href, 'https://snapshots.lavenderfive.com/snapshots/cosmoshub/cosmoshub_')]"));

                    foreach (var link in links)
                    {
                        var href = link.GetAttribute("href");
                        var reg = @"https://snapshots\.lavenderfive\.com/snapshots/cosmoshub/cosmoshub_\d+\.tar\.lz4";
                        if (Regex.IsMatch(href, reg))
                        {
                            return href;
                        }
                    }

                    return string.Empty;
                }
                catch (NoSuchElementException)
                {
                    return string.Empty;
                }
                finally
                {
                    driver.Quit();
                }
            }
        }

        public static bool PrependToScript(string filePath, string downloadLink)
        {
            if (!File.Exists(filePath))
            {
                return false;
            }

            string existingContent = File.ReadAllText(filePath);

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("#!/bin/sh");
            sb.AppendLine($"DOWNLOAD_LINK=\"{downloadLink}\"");
            sb.AppendLine();
            sb.Append(existingContent);

            File.WriteAllText(filePath, sb.ToString());
            return true;
        }
    }

}
