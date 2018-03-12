
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
	
	model.models.quiz.findAll()
	.each(quiz => {
		out.log(`  [${out.colorize(quiz.id, 'magenta')}]: ${quiz.question}`);	
	})
	.catch(error => {
		out.errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
		});
};
const validateId = id => {
	return new Promise((resolve, reject) => {
		if ( typeof id === "undefined") {
			reject(new Error(`Falta el parámetro <id>.`));
			} else {
				id = parseInt(id);
				if (Number.isNaN(id)) {
					reject (new Error(`El parámetro <id> no es válido.`));
				} else {
					resolve(id);
				}
			}
		});
	};
		
exports.testCmd = (rl,id) =>{
validateId(id)
        .then(id => model.models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
           return makeQuestion(rl,quiz.question)
                .then (answer => {
                    if (answer.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                        out.log(`Su respuesta es correcta.`);
                        out.biglog('Correcta', 'green');
                    } else {
                        out.log(`Su respuesta es incorrecta.`);
                        out.biglog('Incorrecta', 'red');
                    }
                    ;
                });
        })
               .catch(Sequelize.ValidationError, error =>{
                   out.errorlog('El quiz es erróneo:');
                    error.errors.forEach((message) => errorlog(message));
                })
                .catch(error =>{
                    out.errorlog(error.message);
                })
                .then(() => {
                    rl.prompt();
                });

};

exports.playCmd = rl => {
	
	 score = 0;

    toBeResolved = []; 
    
    for (i = 0; i < model.getAll().length; i++) {
        toBeResolved[i] = i;
    }

    exports.playCmd =rl=>{
	
	score = 0; 
  	toBePlayed = []; 

     

  		const playOne = () => {
        return new Promise ((resolve, reject) => {
  				if(toBePlayed.length === 0) {
            out.log(' ¡No hay preguntas que responder!','yellow');
            out.log(' Fin del examen. Aciertos: ');
  					resolve();
  					return;
  				}
  				id = Math.abs(Math.floor(Math.random()*toBePlayed.length));
  				quiz = toBePlayed[id];
  		    toBePlayed.splice(id, 1); 
  		    makeQuestion(rl, quiz.question)
  		    .then(answer => {
            if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
              score++;
  				    out.log(`  CORRECTO - Lleva ${score} aciertos`);
  				    resolve(playOne());
            }else{
              out.log('  INCORRECTO ');
              out.log(`  Fin del juego. Aciertos: ${score} `);
  				    resolve();
  			    }
  		    })
  	     })
  	  }
  		model.models.quiz.findAll({raw: true}) 
  		.then(quizzes => {
  			toBePlayed= quizzes;
      })
  		.then(() => {
  		 	return playOne(); 
  		 })
  		.catch(e => {
  			console.log("Error:" + e); 
  		})
  		.then(() => {
  			out.biglog(score, 'blue');
  			rl.prompt();
  	})
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



