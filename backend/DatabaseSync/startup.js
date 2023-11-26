import { spawn } from 'child_process';

function runInNewTerminal(command, args) {
    const process = spawn('gnome-terminal', ['--', 'bash', '-c', `${command} ${args.join(' ')}; exec bash`]);

    process.on('error', (err) => {
        console.error(`Failed to start process: ${err.message}`);
    });
}

runInNewTerminal('ipfs', ['daemon']);
runInNewTerminal('vboxmanage', ['startvm', 'cuckoo1']);
runInNewTerminal('cuckoo');