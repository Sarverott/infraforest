import path from "node:path";
import repl from "node:repl";
import { exec } from "child_process";
import { fileURLToPath } from 'url';

const infraforest_devtool = repl.start("> ");

//console.log("\n\n", path.join(fileURLToPath(import.meta.url), "..", ".."))

const resultPrinter = (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}

infraforest_devtool.context.serviceChain = exec("npm exec task lounch_services", {
	cwd: path.join(fileURLToPath(import.meta.url), "..", ".."),
}, resultPrinter);
infraforest_devtool.context.interface = exec("npm exec task run_interface", {
	cwd: path.join(fileURLToPath(import.meta.url), "..", ".."),
}, resultPrinter);
infraforest_devtool.context.desktop = exec("npm exec task run_desktop", {
	cwd: path.join(fileURLToPath(import.meta.url), "..", ".."),
}, resultPrinter);

infraforest_devtool.context.desktop.on("message", resultPrinter)
infraforest_devtool.context.interface.on("message", resultPrinter)
infraforest_devtool.context.serviceChain.on("message", resultPrinter)

infraforest_devtool.on("exit", () => {
	setInterval(()=>{
		console.log('killing subprecesses');
		if(
			!infraforest_devtool.context.desktop.kill('SIGKILL')
			&&
			!infraforest_devtool.context.interface.kill('SIGKILL')
			&&
			!infraforest_devtool.context.serviceChain.kill('SIGKILL')
		){
			console.log('Received "exit" event from repl!');
			process.exit();
		}
	}, 100);
});
