// constants.ts
let currentHost = "";
let currentProtocol = "";

// if (process.browser) {
currentHost = window.location.hostname;
currentProtocol = window.location.protocol;
// }

export const PLUGIN_NAME = "Plugin.Tezos";
export const PLUGIN_API_SUBPATH = `/plugins/${PLUGIN_NAME}`;

export const KEEPIX_API_URL =
  process.env.REACT_APP_API_URL ||
  `${currentProtocol}//${currentHost}:${
    currentProtocol === "http:" ? 2000 : 9000
  }`;

export const TEZOS_NODE_API_URL = "https://api.tezos-nodes.com/v1";
