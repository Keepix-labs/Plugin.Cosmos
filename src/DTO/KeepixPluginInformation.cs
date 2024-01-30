using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Tezos.src.DTO
{
    public class KeepixPluginInformation
    {
        public string? TzxBalance { get; set; }

        public KeepixPluginStatus? PluginStatus
        {
            get; set;
        }
    }
}
