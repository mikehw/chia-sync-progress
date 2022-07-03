import cliProgress from 'cli-progress';
import { FullNode } from 'chia-client';
import colors from 'ansi-colors';
import { GetFullNodeRPCInfo } from './get-rpc-info';
import { emitKeypressEvents } from 'readline';

const bar = new cliProgress.Bar(
  {
    format:
      'Full Node Sync Progress | ' +
      colors.cyan('{bar}') +
      ' {percentage}% | {value}/{total} | ETA: {eta_formatted} | Blocks/Sec: {blocksPerSec}',
  },
  cliProgress.Presets.shades_classic
);

emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.on('keypress', (chunk, key) => {
  if (key && (key.name == 'escape' || (key.name === 'c' && key.ctrl))) {
    bar.stop();
    process.exit();
  }
});

const main = async () => {
  const client = new FullNode(GetFullNodeRPCInfo());
  const currentState = await client.getBlockchainState();
  let synced = currentState.blockchain_state.sync.synced;

  bar.start(
    currentState.blockchain_state.sync.sync_tip_height,
    currentState.blockchain_state.sync.sync_progress_height,
    { blocksPerSec: '??' }
  );
  let previousProgressHeight = currentState.blockchain_state.sync.sync_progress_height;
  while (!synced) {
    const start = new Date();
    await sleep(5000);
    const newState = await client.getBlockchainState();
    const now = new Date();
    const blocksPerSec = Math.round(
      (newState.blockchain_state.sync.sync_progress_height - previousProgressHeight) /
        ((now.getTime() - start.getTime()) / 1000)
    );
    bar.update(newState.blockchain_state.sync.sync_progress_height, {
      blocksPerSec,
    });
    previousProgressHeight = newState.blockchain_state.sync.sync_progress_height;
    synced = newState.blockchain_state.sync.synced;
  }
  console.log('✨ Synced! ✨');
};

main();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
