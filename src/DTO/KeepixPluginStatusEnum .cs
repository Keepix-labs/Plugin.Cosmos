using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Tezos.src.DTO
{
    public static class KeepixPluginStatusEnum
    {
        public static readonly string Stopped = "STOPPED";
        public static readonly string Running = "RUNNING";
        public static readonly string PreInstalling = "PRE-INSTALLING";
        public static readonly string Installing = "INSTALLING";
        public static readonly string Uninstalling = "UNINSTALLING";
        public static readonly string None = "NONE";
    }
}
