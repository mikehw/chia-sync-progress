# Chia Sync Progress

A simple CLI progress bar for checking the status of your chia node sync.

## Usage

Install Node v12+

Execute `npx chia-sync-progress`

![Example of chia-sync-progress running](/assets/images/example.png)

If your chia config is not in the default location `~/.chia/mainnet/config/config.yaml` you can specify the following environment variables.
```env
FULL_NODE_CERT_PATH
FULL_NODE_KEY_PATH
FULL_NODE_HOSTNAME
FULL_NODE_PORT
CA_CERT_PATH
```

Press escape or ctrl + c to exit