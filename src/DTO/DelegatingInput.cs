using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin.Tezos.src.DTO
{
    public class DelegatingInput
    {
        public string? WalletSecretKey { get; set; }
        public string? WalletName { get; set; }


        public string? WalletAddress { get; set; }
    }
}
