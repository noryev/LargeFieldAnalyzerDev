import { spawn } from 'child_process';

// Function to run a command in a new terminal window
function runInNewTerminal(command, args) {
    // Change 'xterm' to your preferred terminal emulator if necessary
    spawn('xterm', ['-e', 'bash', '-c', `${command} ${args.join(' ')}; exec bash`], { shell: true });
}

// Start the IPFS daemon in the current terminal
const ipfsDaemon = spawn('ipfs', ['daemon'], { shell: true });

ipfsDaemon.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ipfsDaemon.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ipfsDaemon.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

// Start VirtualBox VM in a new terminal
runInNewTerminal('vboxmanage', ['startvm', 'cuckoo1']);
