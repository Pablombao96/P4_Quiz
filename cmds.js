
const model = require('./model');
const out= require("./out");
const Sequelize=require('sequelize');



exports.helpCmd = (socket, rl) => {
	
		out.log(socket, "Comandos:");
		out.log(socket, " h|help  Muestra esta ayuda.");
		out.log(socket, " list : Listar los quizzes existentes.");
		out.log(socket, " show <id> : Muestra la pregunta y la respuesta asociado al id.");
		out.log(socket, " add : Añade una pregunta al programa.");
		out.log(socket, " delete <id> : Elimina una pregunta del programa.");
		out.log(socket, " edit <id> : Se utiliza para editar una pregunta y una respuesta con su id asociado.");
		out.log(socket, " test <id> : Probar una pregunta.");
		out.log(socket, " p|play : Jugar al quiz normal.");
		out.log(socket, " credits : Nombre de los autores de la práctica.");
		out.log(socket, " q|quit : Termina la ejecución del programa.");
	rl.prompt();
};


exports.quitCmd = (socket, rl) => {
	rl.close();
	socket.end();

};

const makeQuestion=(rl,text)=>{
	return new Sequelize.Promise((resolve,reject)=>{
		rl.question(out.colorize(text,'red'),answer=>{
			resolve(answer.trim())
		});
	});
};

exports.addCmd = (socket, rl) => {
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
		out.log(socket, `${out.colorize(quiz.id,'magenta')}: ${quiz.question} ${out.colorize('=>','magenta')} ${quiz.answer}`);

	})
	.catch(Sequelize.ValidationError,error=>{
		out.errorlog(socket, 'El quiz es erroneo:');
		error.errors.forEach((message)=>out.errorlog(socket, message));
	})
	.catch(error=>{
		out.errorlog(socket, error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};


exports.listCmd = (socket, rl) =>{
	
	model.models.quiz.findAll()
	.each(quiz=>{
			out.log(socket, `[${out.colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
			})
	
.catch(error=>{
	out.errorlog(socket, error.message);
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
exports.testCmd = (socket, rl,id) =>{
validateId(id)
        .then(id => model.models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
           return makeQuestion(rl,quiz.question)
                .then (answer => {
                    if (answer.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                        out.log(socket, `Su respuesta es correcta.`);
                        out.biglog(socket, 'Correcta', 'green');
                    } else {
                        out.log(socket, `Su respuesta es incorrecta.`);
                        out.biglog(socket, 'Incorrecta', 'red');
                    }
                    ;
                });
        })
               .catch(Sequelize.ValidationError, error =>{
                   out.errorlog(socket, 'El quiz es erróneo:');
                    error.errors.forEach((message) => out.errorlog(socket, message));
                })
                .catch(error =>{
                    out.errorlog(socket, error.message);
                })
                .then(() => {
                    rl.prompt();
                });

};


    exports.playCmd =(socket, rl) =>{
	
	score = 0; 
  	toBePlayed = []; 

     

  		const playOne = () => {
        return new Promise ((resolve, reject) => {
  				if(toBePlayed.length === 0) {
            out.log(socket, ' ¡No hay preguntas que responder!','yellow');
            out.log(socket, ' Fin del examen. Aciertos: ');
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
  				    out.log(socket, `  CORRECTO - Lleva ${score} aciertos`);
  				    resolve(playOne());
            }else{
              out.log(socket, '  INCORRECTO ');
              out.log(socket, `  Fin del juego. Aciertos: ${score} `);
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
  			console.log(socket, "Error:" + e); 
  		})
  		.then(() => {
  			out.biglog(socket, score, 'blue');
  			rl.prompt();
  	})
};


exports.showCmd = (socket, rl,id)=>{
	
	validateId(id)
	.then(id=>model.models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		out.log(socket, `${out.colorize(quiz.id,'magenta')}: ${quiz.question} ${out.colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error=>{
		out.errorlog(socket, error.message);
	})
	.then(()=>{
		rl.prompt();

	});
};

exports.deleteCmd =(socket, rl,id)=>{
	
	validateId(id)
	.then(id=>model.models.quiz.destroy({where:{id}}))
	.catch(error=>{
		out.errorlog(socket, error.message);

	})
	.then(()=>{
		rl.prompt();
	});
};

exports.editCmd =(socket, rl, id)=>{
	
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
		out.log(socket, `${out.colorize(quiz.id,'magenta')}: ${quiz.question} ${out.colorize('=>','magenta')} ${quiz.answer}`);
	})
	 .catch(Sequelize.ValidationError, error => {
            out.errorlog(socket, 'El quiz es erroneo:');
            error.errors.forEach((message) => out.errorlog(socket, message));
        })
        .catch(error => {
            out.errorlog(socket, error.message);
        })
        .then(() => {
            rl.prompt();
        });
	
};
exports.creditsCmd = (socket,rl) => {
	out.log(socket, 'Autores de la práctica:');
	out.log(socket, 'Pablo Lombao Díaz', 'green');
	rl.prompt();
};



