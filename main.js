
const readline = require('readline');



const out= require("./out");
const cmds = require("./cmds");
const net = require("net");

net.createServer(socket => {

    console.log("Se ha conectado un cliente desde " + socket.remoteAddress);

//Mensaje inicial
out.biglog(socket, 'CORE Quiz', 'green');



const rl = readline.createInterface({
  input: socket,
  output: socket,
  prompt: out.colorize("quiz> ", 'blue'),
  completer: (line) => {
  const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
  const hits = completions.filter((c) => c.startsWith(line));
  // show all completions if none found
  return [hits.length ? hits : completions, line];
}

});

socket
.on("end", () => { rl.close();})
.on("error", () => { rl.close();});

rl.prompt();

rl
.on('line', (line) => {
	 args = line.split(" ");
	 cmd = args[0].toLowerCase().trim();
  switch (cmd){
	case '':
	rl.prompt();
	break;
	case 'h':
	case 'help':
		cmds.helpCmd(socket, rl);
		break;

    case 'quit':
    case 'q':
      cmds.quitCmd(socket, rl);
      break;
    case 'add':
	cmds.addCmd(socket, rl);
	break;
    case 'list':
	cmds.listCmd(socket, rl);
	break;
    case 'show':
	cmds.showCmd(socket, rl, args[1]);
	break;
    case 'test':
	cmds.testCmd(socket, rl, args[1]);
	break;
    case 'play':
    case 'p':
	cmds.playCmd(socket, rl);
	break;
    case 'delete':
	cmds.deleteCmd(socket, rl, args[1]);
	break;
    case 'edit':
	cmds.editCmd(socket, rl, args[1]);
	break;
    case 'credits':
	cmds.creditsCmd(socket, rl);

	break;
    default:
        out.log(socket, `Comando desconocido: '${out.colorize(cmd, 'red')}'`);
	out.log(socket, `Use ${out.colorize('help', 'green')} para ver todos los comandos disponibles.`);
	rl.prompt();
      break;
  }
  
})
.on('close', () => {
  out.log(socket, 'Adios');
  // process.exit(0);
});



})

.listen(3030);

