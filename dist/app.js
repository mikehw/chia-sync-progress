"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_progress_1 = __importDefault(require("cli-progress"));
const chia_client_1 = require("chia-client");
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const get_rpc_info_1 = require("./get-rpc-info");
const readline_1 = require("readline");
const bar = new cli_progress_1.default.Bar({
    format: 'Full Node Sync Progress | ' +
        ansi_colors_1.default.cyan('{bar}') +
        ' {percentage}% | {value}/{total} | ETA: {eta_formatted} | Blocks/Sec: {blocksPerSec}',
}, cli_progress_1.default.Presets.shades_classic);
(0, readline_1.emitKeypressEvents)(process.stdin);
if (process.stdin.isTTY)
    process.stdin.setRawMode(true);
process.stdin.on('keypress', (chunk, key) => {
    if (key && (key.name == 'escape' || (key.name === 'c' && key.ctrl))) {
        bar.stop();
        process.exit();
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = new chia_client_1.FullNode((0, get_rpc_info_1.GetFullNodeRPCInfo)());
    const currentState = yield client.getBlockchainState();
    let synced = currentState.blockchain_state.sync.synced;
    bar.start(currentState.blockchain_state.sync.sync_tip_height, currentState.blockchain_state.sync.sync_progress_height, { blocksPerSec: '??' });
    let previousProgressHeight = currentState.blockchain_state.sync.sync_progress_height;
    while (!synced) {
        const start = new Date();
        yield sleep(5000);
        const newState = yield client.getBlockchainState();
        const now = new Date();
        const blocksPerSec = Math.round((newState.blockchain_state.sync.sync_progress_height - previousProgressHeight) /
            ((now.getTime() - start.getTime()) / 1000));
        bar.update(newState.blockchain_state.sync.sync_progress_height, {
            blocksPerSec,
        });
        previousProgressHeight = newState.blockchain_state.sync.sync_progress_height;
        synced = newState.blockchain_state.sync.synced;
    }
    console.log('✨ Synced! ✨');
});
main();
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
