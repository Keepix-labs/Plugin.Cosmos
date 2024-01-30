using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Tezos.src.Utils
{

    public static class HttpClientExtensions
    {
        public static async Task DownloadFileAsync(this HttpClient client, string requestUri, string outputPath)
        {
            using var response = await client.GetAsync(requestUri, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();

            using var fileStream = new FileStream(outputPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
            await response.Content.CopyToAsync(fileStream).ConfigureAwait(false);
        }
    }

}
