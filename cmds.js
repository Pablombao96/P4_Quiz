const model = require('./model');
const out= require("./out");



exports.helpCmd = rl => {
	
		out.log("Comandos:");
		out.log(" h|help  Muestra esta ayuda.");
		out.log(" list : Listar los quizzes existentes.");
		out.log(" show <id> : Muestra la pregunta y la respuesta asociado al id.");
		out.log(" add : Añade una pregunta al programa.");
		out.log(" delete <id> : Elimina una pregunta del programa.");
		out.log(" edit <id> : Se utiliza para editar una pregunta y una respuesta con su id asociado.");
		out.log(" test <id> : Probar una pregunta.");
		out.log(" p|play : Jugar al quiz normal.");
		out.log(" credits : Nombre de los autores de la práctica.");
		out.log(" q|quit : Termina la ejecución del programa.");
	rl.prompt();
};


exports.quitCmd = rl => {
	rl.close();
	rl.prompt();
};

exports.addCmd = rl => {
	rl.question(out.colorize(' Introduzca una pregunta: ', 'red'), question => {
		rl.question(out.colorize(' Introduzca la respuesta: ', 'red'), answer => {
			model.add(question, answer);
			out.log(` ${out.colorize('Se ha añadido', 'magenta')}: ${question} ${out.colorize('=>', 'magenta')} ${answer}`);
			rl.prompt();
		});
	 });
	
	
	
	
};

exports.listCmd = rl => {
	model.getAll().forEach((quiz, id) => {
		out.log(`  [${out.colorize(id, 'magenta')}]: ${quiz.question}`);
	
	});
	rl.prompt();
};

exports.showCmd = (rl, id) => {
	
	if (typeof id === "undefined") {
		out.errorlog(`Falta el parámetro id.`);
	} else {
		try {
			const quiz = model.getByIndex(id);
			out.log(` [${out.colorize(id, 'magenta')}]:  ${quiz.question} ${out.colorize('=>', 'magenta')}  ${quiz.answer}`);
		} catch(error) {
			out.errorlog(error.message);
		}
	}
	
	rl.prompt();
};

exports.testCmd=(rl, id)  => {
	
	if (typeof id==="undefined") {
		out.errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			rl.question(`${out.colorize(quiz.question, 'red')} `, question => {     
         	if(question.toLowerCase().trim() === quiz.answer.toLowerCase()){
            	out.log("Su respuesta es:");
               out.biglog('CORRECTA','green');
                }else{
                	out.log("Su respuesta es:");
                  out. biglog('INCORRECTA', 'red');
                }
                rl.prompt();
            });
        } catch(error){
            out.errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.playCmd = rl => {
	
	 score = 0;

    toBeResolved = []; 
    
    for (i = 0; i < model.getAll().length; i++) {
        toBeResolved[i] = i;
    }

    const playOne = () => {
        if (toBeResolved.length === 0) {
            out.log("No hay más preguntas");
            out.log("Su resultado: " + score);
            out.biglog(score,"green");
            rl.prompt();
        } else {
            indice = Math.floor(Math.random() * toBeResolved.length);
            id = toBeResolved[indice];
            toBeResolved.splice(indice, 1);
            quiz = model.getByIndex(id);
            //.question(quiz.question + "?  ", respuesta => {
            rl.question(`${out.colorize(quiz.question, 'red')} `, respuesta => {
                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                    score++;
                    out.log("CORRECTO - Lleva "+ score + " aciertos");
                    out.biglog(score,"green");
                    playOne();
                }
                else {
                    out.log("INCORRECTO - Fin del juego. Aciertos "+ score);
                    out.biglog(score, "green");

                }
                rl.prompt();
            });

        }
    };
    playOne();

};

exports.deleteCmd = (rl,id) => {
	if (typeof id === "undefined") {
		out.errorlog(`Falta el parámetro id.`);
	} else {
		try {
			model.deleteByIndex(id);
	
		} catch(error) {
			out.errorlog(error.message);
		}
	}
	
	rl.prompt();
};

exports.editCmd = (rl,id) => {
	if (typeof id === "undefined")  {
		out.errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
			rl.question(out.colorize(' Introduzca una pregunta: ', 'red'), question => {
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				rl.question(out.colorize(' Introduzca la respuesta ', 'red'), answer => {
					model.update(id, question, answer);
					out.log(` Se ha cambiado el quiz ${out.colorize(id, 'magenta')} por: ${question} ${out.colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
		} catch(error) {
			out.errorlog(error.message);
			rl.prompt();
		}
	}
};

exports.creditsCmd = rl => {
	out.log('Autores de la práctica:');
	out.log('Pablo Lombao Díaz', 'green');
	rl.prompt();
};


