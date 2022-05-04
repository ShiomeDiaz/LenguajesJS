let gramm = ["S->A sp t s s|A sp t t|A sp t", "A->λ|c D|if"];
/*
let gramm = [
  "I->if ( comp ) { instr }|if ( comp ) { instr } else { instr }",
  "A->]|sp if|comp",
];
*/
let productores = [];
let producto = [];

let sinOr = [];
let termAndNoTerm = [];

let terminales = [];
let noTerminales = [];

let grammLL1 = [];

function separador(gramm) {
  for (let i = 0; i < gramm.length; i++) {
    let [produce, producido] = gramm[i].split("->");
    productores.push(produce);
    noTerminales.push(produce);
    producto.push(producido);
  }
}
// Parte donde se separa los productores y lo producido
separador(gramm);
console.log("separacion de terminales y no terminales");
console.log(productores);
console.log(producto);

for (let i = 0; i < producto.length; i++) {
  sinOr = producto[i].split("|");
  for (let j = 0; j < sinOr.length; j++) {
    termAndNoTerm.push(sinOr[j].split(" "));
  }
}

//parte donde se separan por el OR "|" y por terminales y no terminales
console.log("Sin or y terminales y no terminales juntos");
console.log(sinOr);
console.log(termAndNoTerm);

//funcion para saber si es terminal o no terminal
// True para NoTerminal
// False para terminal
function esNoTerminal(caracter) {
  return /[A-Z]/.test(caracter);
}

for (let i = 0; i < termAndNoTerm.length; i++) {
  let aux = termAndNoTerm[i];
  for (let j = 0; j < aux.length; j++) {
    if (esNoTerminal(aux[j]) && !noTerminales.includes(aux[j])) {
      noTerminales.push(aux[j]);
    } else if (!esNoTerminal(aux[j]) && !terminales.includes(aux[j])) {
      terminales.push(aux[j]);
    } else if (!terminales.includes("λ")) {
      terminales.push("λ");
    }
  }
}

console.log("Terminales y no terminales separados");
console.log(noTerminales);
console.log(terminales);

function extractProduccionesNoOr(line) {
  let productosNoOr = [];
  for (let i = 0; i < line.length; i++) {
    productosNoOr.push(line[i].split(" "));
  }
  return productosNoOr;
}

//factorizacion izq
/*
 *
 */
function tieneFactorizacionIzq(line) {
  let copyGram = extractProduccionesNoOr(line.split("|"));
  let allCaracters = noTerminales.concat(terminales);
  let flag = 0;
  for (let i = 0; i < allCaracters.length; i++) {
    for (let j = 0; j < copyGram.length; j++) {
      if (copyGram[j][0] === allCaracters[i]) {
        flag++;
      }
    }
    if (flag >= 2) {
      flag = 0;
      return true;
    } else {
      flag = 0;
    }
  }
  return false;
}

function factorizacionIzq(line) {
  let [productor, produccion] = line.split("->");
  let copyGram = extractProduccionesNoOr(produccion.split("|"));
  // aca se vaa a generar la nueva produccion al primero
  // y al segundo que es el que representa la ejecucion de la factorizacion
  let newProduccionFirst = "";
  let newProduccionFollow = "";
  //Bandera para poder agregarlo a la new produccion
  let flag = 0;
  let newAllCaracteeres = noTerminales.concat(terminales);

  /*
   * Lo primero que hay que hacer es agregar lo que hay repetido en la
   * linea para factorizar, el ejemplo seria que esta
   *       S->A sp s|A sp t|A sp
   * lo que hay que almacenar en follow es
   *       S'->A sp
   * y lo que hay que alamacennar en first seria
   *       S->S' s|S' t|S'
   */
  for (let i = 0; i < newAllCaracteeres.length; i++) {
    for (let j = 0; j < copyGram.length; j++) {
      if (copyGram[j].includes(newAllCaracteeres[i])) {
        flag++;
      }
    }
    if (flag >= 2) {
      for (let j = 0; j < copyGram.length; j++) {
        for (let k = 0; k < copyGram[j].length; k++) {
          /*
           * Aca entra si en esa produccion encuentra el caracter 2 o mas veces
           * preguta si es la posicion 0 y si es igual al caracter que entro y en
           * la produccion follow hay algo, si no hay nada este es el inicio de
           * como va a quedar nuestra factorizacion por eso a new follow
           * queda con su nuevo productor que seria S'
           */
          if (
            copyGram[j][k] === newAllCaracteeres[i] &&
            k == 0 &&
            newProduccionFollow === ""
          ) {
            newProduccionFollow = productor + "'" + "->" + copyGram[j][k];
          } else if (
            /*
             * Aca pregunta si el valor anterior si esta dentro de lo que se debe factorizar
             * si esta en new follow y si el valor a ingresar no esta agregado lo agrega con el espacio
             * y se va para el final
             */
            copyGram[j][k] === newAllCaracteeres[i] &&
            newProduccionFollow.includes(copyGram[j][k - 1]) &&
            !newProduccionFollow.includes(copyGram[j][k])
          ) {
            newProduccionFollow = newProduccionFollow + " " + copyGram[j][k];
          }
        }
      }
      flag = 0;
    } else {
      //Aca falta hacer para el new produccion first
      //Re factorizar en metodos para que se mas facil de entender
      for (let j = 0; j < copyGram.length; j++) {
        for (let k = 0; k < copyGram[j].length; k++) {
          if (
            copyGram[j][k] === newAllCaracteeres[i] &&
            j == 0 &&
            newProduccionFirst === "" &&
            newProduccionFollow.includes(copyGram[j][k - 1])
          ) {
            newProduccionFirst =
              productor + "->" + productor + "' " + copyGram[j][k];
          } else if (
            copyGram[j][k] === newAllCaracteeres[i] &&
            !newProduccionFirst.includes(copyGram[j][k]) &&
            newProduccionFollow.includes(copyGram[j][k - 1])
          ) {
            newProduccionFirst =
              newProduccionFirst + "|" + productor + "' " + copyGram[j][k];
          }
        }
      }
      flag = 0;
    }
  }
  console.log("Firs producction: " + newProduccionFirst);
  console.log("Follow produccion: " + newProduccionFollow);
}
console.log("Intento de resolver factorizacion izq");
console.log("Esto muestra si hay que factorizar por izquierda");
for (let i = 0; i < gramm.length; i++) {
  let [Pgram, pgram] = gramm[i].split("->");
  console.log("tiene facto izq: " + tieneFactorizacionIzq(pgram));
  if (tieneFactorizacionIzq(pgram)) {
    factorizacionIzq(gramm[i]);
  }
}
