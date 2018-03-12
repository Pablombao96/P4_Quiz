
const model = require('./model');
const out= require("./out");
const Sequelize=require('sequelize');



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

const makeQuestion=(rl,text)=>{
	return new Sequelize.Promise((resolve,reject)=>{
		rl.question(out.colorize(text,'red'),answer=>{
			resolve(answer.trim())
		});
	});
};

exports.addCmd = rl => {
	makeQuestion(rl,'Introduzca una pregunta:')
	.then(q=>{
		return makeQuestion(rl,'Introduzca la respuesta: ')
		.then(a=>{
			return {question:q,answer:a};
		});
	})
	.then(quiz=>{
		return model.models.quiz.create(quiz);
	})
	.then((quiz)=>{
		out.log(`${out.colorize(quiz.id,'magenta')}: ${quiz.question} ${out.colorize('=>','magenta')} ${quiz.answer}`);

	})
	.catch(Sequelize.ValidationError,error=>{
		out.errorlog('El quiz es erroneo:');
		error.errors.forEach((message)=>out.errorlog(message));
	})
	.catch(error=>{
		out.errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};


exports.listCmd = rl =>{
	
	model.models.quiz.findAll()
	.each(quiz=>{
			out.log(`[${out.colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
			})
	
.catch(error=>{
	out.errorlog(error.message);
})
.then(()=>{
	rl.prompt();
})
};


const validateId=id=>{
	return new Sequelize.Promise((resolve,reject)=>{
		if(typeof id==="undefined"){
			reject(new Error(`Falta el parametro <id>.`));

		}else{
			id=parseInt(id); //coger la parte entera y descartar lo demás
			if(Number.isNaN(id)){
				reject(new Error(`El valor del parametro <id> no es un número.`));
			}else{
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
                    error.errors.forEach((message) => out.errorlog(message));
                })
                .catch(error =>{
                    out.errorlog(error.message);
                })
                .then(() => {
                    rl.prompt();
                });

};


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


exports.showCmd = (rl,id)=>{
	
	validateId(id)
	.then(id=>model.models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		out.log(`${out.colorize(quiz.id,'magenta')}: ${quiz.question} ${out.colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error=>{
		out.errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();

	});
};

exports.deleteCmd =(rl,id)=>{
	
	validateId(id)
	.then(id=>model.models.quiz.destroy({where:{id}}))
	.catch(error=>{
		out.errorlog(error.message);

	})
	.then(()=>{
		rl.prompt();
	});
};

exports.editCmd =(rl, id)=>{
	
	validateId(id)
	.then(id=>model.models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca la pregunta:')
		.then(q=>{
			process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
		return makeQuestion(rl, 'Introduzca la respuesta:')
		.then(a=>{
			quiz.question=q;
			quiz.answer=a;
			return quiz;
		});

		});
	})
	.then(quiz=>{
		return quiz.save();
	})
	.then(quiz=>{
		out.log(`${out.colorize(quiz.id,'magenta')}: ${quiz.question} ${out.colorize('=>','magenta')} ${quiz.answer}`);
	})
	 .catch(Sequelize.ValidationError, error => {
            out.errorlog('El quiz es erroneo:');
            error.errors.forEach((message) => out.errorlog(message));
        })
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
	
};
exports.creditsCmd = rl => {
	out.log('Autores de la práctica:');
	out.log('Pablo Lombao Díaz', 'green');
	rl.prompt();
};



