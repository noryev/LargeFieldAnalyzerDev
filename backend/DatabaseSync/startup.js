import { spawn } from 'child_process';

function runInNewTerminal(command, args) {
    spawn('gnome-terminal', ['--', 'bash', '-c', `${command} ${args.join(' ')}; exec bash`]);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startProcesses() {
    // Start the IPFS daemon
    runInNewTerminal('ipfs', ['daemon']);

    // Start VirtualBox VM
    runInNewTerminal('vboxmanage', ['startvm', 'cuckoo1']);

    // Wait for 45 seconds
    await sleep(45000);

    // Start Cuckoo
    runInNewTerminal('cuckoo', []);
}

startProcesses();
