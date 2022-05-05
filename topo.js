let gramm = ["S->A sp s p|A sp t|A sp", "A->λ|c D|if"];
//let gramm = ["S->S ps t|T t|if", "T->as|if|λ"];
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
    } else if (aux[j].includes("'") && !noTerminales.includes(aux[j])) {
      noTerminales.push(aux[j]);
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
  let [productor, produccion] = line.split("->");
  let copyGram = extractProduccionesNoOr(produccion.split("|"));
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
    if (flag < 2) {
      for (let j = 0; j < copyGram.length; j++) {
        for (let k = 0; k < copyGram[j].length; k++) {
          if (copyGram[j][k] === newAllCaracteeres[i]) {
            if (newProduccionFollow === "") {
              newProduccionFollow = `${productor}'->${copyGram[j][k]}`;
            } else {
              if (!newProduccionFollow.includes(copyGram[j][k])) {
                if (newProduccionFollow.includes(copyGram[j][k - 1])) {
                  newProduccionFollow =
                    newProduccionFollow + " " + copyGram[j][k];
                } else {
                  newProduccionFollow =
                    newProduccionFollow + `|${copyGram[j][k]}`;
                }
              }
            }
          }
        }
      }
      flag = 0;
    } else {
      for (let j = 0; j < copyGram.length; j++) {
        for (let k = 0; k < copyGram[j].length; k++) {
          if (copyGram[j][k] === newAllCaracteeres[i]) {
            if (newProduccionFirst === "") {
              newProduccionFirst = `${productor}->${copyGram[j][k]}`;
            } else if (
              newProduccionFirst.includes(copyGram[j][k - 1]) &&
              !newProduccionFirst.includes(copyGram[j][k])
            ) {
              newProduccionFirst = newProduccionFirst + " " + copyGram[j][k];
            }
          }
        }
      }
      flag = 0;
    }
  }
  newProduccionFirst = newProduccionFirst + ` ${productor}'`;
  newProduccionFollow = newProduccionFollow + "|λ";
  grammLL1.push(newProduccionFirst, newProduccionFollow);
  console.log("Firs producction: " + newProduccionFirst);
  console.log("Follow produccion: " + newProduccionFollow);
}
console.log(
  "Esto muestra si hay que factorizar por izquierda y tambien muestra como queda despues de la facto izq"
);
for (let i = 0; i < gramm.length; i++) {
  console.log("tiene facto izq: " + tieneFactorizacionIzq(gramm[i]));
  if (tieneFactorizacionIzq(gramm[i])) {
    factorizacionIzq(gramm[i]);
  } else {
    grammLL1.push(gramm[i]);
  }
}
console.log("Antes de factorizacion");
console.log(gramm);
console.log("Despues de la factorizacion queda asi: ");
console.log(grammLL1);
console.log("------------------Recursion izq-----------------");
/*
 * Metodo para recursion izq
 *
 */
function tieneRecursionIzquierda(line) {
  let [productor, produccion] = line.split("->");
  let copyGram = extractProduccionesNoOr(produccion.split("|"));
  let flag = 0;

  for (let i = 0; i < copyGram.length; i++) {
    if (copyGram[i][0] === productor) {
      flag++;
    }
  }
  if (flag >= 1) {
    return true;
  } else {
    return false;
  }
}

function arrayToString(arr) {
  let cadena = "";
  for (let i = 0; i < arr.length; i++) {
    if (i == 0) {
      cadena = arr[i];
    } else {
      cadena = cadena + " " + arr[i];
    }
  }
  return cadena;
}

function eliminarRecursionIzq(line) {
  let [productor, produccion] = line.split("->");
  let copyGram = extractProduccionesNoOr(produccion.split("|"));
  let newFirst = "";
  let newFollow = "";
  for (let i = 0; i < copyGram.length; i++) {
    if (copyGram[i].includes(productor)) {
      for (let j = 0; j < copyGram[i].length; j++) {
        if (copyGram[i][j] != productor) {
          if (newFollow === "") {
            newFollow = `${productor}'->${arrayToString(
              copyGram[i].filter((char) => char != productor)
            )} ${productor}'`;
          } else if (!newFollow.includes(copyGram[i][j])) {
            newFollow = newFollow + `|${copyGram[i][j]} ${productor}'`;
          }
        }
      }
    } else {
      for (let j = 0; j < copyGram[i].length; j++) {
        if (copyGram[i][j] != productor) {
          if (newFirst === "") {
            newFirst = `${productor}->${arrayToString(
              copyGram[i]
            )} ${productor}'`;
          } else if (!newFirst.includes(copyGram[i][j])) {
            newFirst =
              newFirst + `|${arrayToString(copyGram[i])} ${productor}'`;
          }
        }
      }
    }
  }
  console.log("new first: " + newFirst);
  console.log("new follow: " + newFollow);
}
for (let i = 0; i < gramm.length; i++) {
  console.log(gramm[i]);
  if (tieneRecursionIzquierda(gramm[i])) {
    eliminarRecursionIzq(gramm[i]);
  }
}
