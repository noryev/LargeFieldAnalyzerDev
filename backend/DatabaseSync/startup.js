import { spawn } from 'child_process';

function runInNewTerminal(command, args) {
    spawn('gnome-terminal', ['--', 'bash', '-c', `${command} ${args.join(' ')}; exec bash`]);
}

runInNewTerminal('ipfs', ['daemon']);
runInNewTerminal('vboxmanage', ['startvm', 'cuckoo1']);
