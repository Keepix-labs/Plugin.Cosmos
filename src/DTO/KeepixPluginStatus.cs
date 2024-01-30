using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Tezos.src.DTO
{
    public class KeepixPluginStatus
    {
        public string? Status { get; set; }
        public string? Description { get; set; }

        public int? percentage { get; set; }
    }
}
