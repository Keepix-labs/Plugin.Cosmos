
GAIA_HOME="/root/.gaia"
CONFIG_DIR="$GAIA_HOME/config"
APP_TOML="$CONFIG_DIR/app.toml"
CONFIG_TOML="$CONFIG_DIR/config.toml"

MAX_NUM_OUTBOUND=90
SEEDS="ade4d8bc8cbe014af6ebdf3cb7b1e9ad36f412c0@seeds.polkachu.com:14956"
RPC="https://cosmos-rpc.polkachu.com:443,https://rest-cosmoshub.architectnodes.com:443"

PRUNING="custom"
PRUNING_KEEP_RECENT="100"
PRUNING_KEEP_EVERY="0"
PRUNING_INTERVAL="10"

update_or_add() {
    local key="$1"
    local value="$2"
    local file="$3"
    if grep -q "^${key} " "$file"; then
        sed -i "s/^${key} = .*/${key} = \"${value}\"/" "$file"
    else
        echo "${key} = \"${value}\"" >> "$file"
    fi
}

download_file() {
    wget --timeout=120 -c $DOWNLOAD_LINK -O /root/cosmos.tar.lz4
}

check_download_success() {
    if [ $? -eq 0 ]; then
        return 0 
    else
        return 1
    fi
}

if [ ! -f "$CONFIG_DIR/genesis.json" ]; then

    download_file

    if check_download_success; then
        echo "Download successful."
    else
        echo "Download failed. Exiting script."
        exit 1
    fi

    gaiad init my-node --chain-id cosmoshub-4

    sed -i 's/minimum-gas-prices = ""/minimum-gas-prices = "0.0025uatom"/' "$APP_TOML"

    sed -i "s/seeds = \"\"/seeds = \"$SEEDS\"/" "$CONFIG_TOML"


    awk -v bh="$MAX_NUM_OUTBOUND" 'BEGIN{FS=OFS="="} /max_num_outbound_peers/{ $2=" "bh} {print}' "$CONFIG_TOML" > temp && mv temp "$CONFIG_TOML"

    update_or_add "rpc_servers" "$RPC" "$CONFIG_TOML"

    update_or_add "pruning" "$PRUNING" "$APP_TOML"
    update_or_add "pruning-keep-recent" "$PRUNING_KEEP_RECENT" "$APP_TOML"
    update_or_add "pruning-keep-every" "$PRUNING_KEEP_EVERY" "$APP_TOML"
    update_or_add "pruning-interval" "$PRUNING_INTERVAL" "$APP_TOML"

    lz4 -d /root/cosmos.tar.lz4 | tar -xvf - -C "$GAIA_HOME"
    rm /root/cosmos.tar.lz4


    wget https://github.com/cosmos/mainnet/raw/master/genesis/genesis.cosmoshub-4.json.gz -O $GAIA_HOME/genesis.cosmoshub-4.json.gz
    gzip -d $GAIA_HOME/genesis.cosmoshub-4.json.gz
    mv $GAIA_HOME/genesis.cosmoshub-4.json $CONFIG_DIR/genesis.json
fi

if [ "$#" -eq 0 ]; then
    exec gaiad start  --x-crisis-skip-assert-invariants
else
    exec "$@"
fi