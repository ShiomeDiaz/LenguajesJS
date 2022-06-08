let gramm = ["S->A sp s p|A sp t|A sp", "A->λ|c d|if"];
//["S->A sp s p|A sp t|A sp", "A->λ|c d|if"], ["S->A sp s p|A sp t|A sp", "A->λ|c D|if"]

let productores = [];
let producido = [];
let noTerminales = [];
let noOr = [];
let terminales = [];
let termyNoTerm = [];
let grammNoRecursion = [];
let grammLL1 = [];
let grammLR0 = [];
let primeros = [];
let siguientes = [];
let prodPrimeros = [];
let listaPrimeros = [];
let listaSiguientes = [];
let flag = true;
let mapa = new Map();

function esNoTerminal(caracter) {
  return /[A-Z]/.test(caracter);
}

function extractProduccionesNoOr(line) {
  let productosNoOr = [];
  for (let i = 0; i < line.length; i++) {
    productosNoOr.push(line[i].split(" "));
  }
  return productosNoOr;
}

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
}

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
    if (i === 0) {
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
        if (copyGram[i][j] !== productor) {
          if (newFollow === "") {
            newFollow = `${productor}'->${arrayToString(
              copyGram[i].filter((char) => char !== productor)
            )} ${productor}'`;
          } else if (!newFollow.includes(copyGram[i][j])) {
            newFollow = newFollow + `|${copyGram[i][j]} ${productor}'`;
          }
        }
      }
    } else {
      for (let j = 0; j < copyGram[i].length; j++) {
        if (copyGram[i][j] !== productor) {
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
  newFollow = newFollow + "|λ";
  grammNoRecursion.push(newFirst, newFollow);
}

function organizarGramatica(gramm) {
  for (let i = 0; i < gramm.length; i++) {
    if (tieneRecursionIzquierda(gramm[i])) {
      eliminarRecursionIzq(gramm[i]);
    } else {
      grammNoRecursion.push(gramm[i]);
    }
  }

  for (let i = 0; i < grammNoRecursion.length; i++) {
    if (tieneFactorizacionIzq(grammNoRecursion[i])) {
      factorizacionIzq(grammNoRecursion[i]);
    } else {
      grammLL1.push(grammNoRecursion[i]);
    }
  }
}

function separador(gramm) {
  for (let i = 0; i < gramm.length; i++) {
    let [productor, produ] = gramm[i].split("->");
    productores.push(productor);
    if (!noTerminales.includes(productor)) {
      noTerminales.push(productor);
    }
    producido.push(produ);
  }

  for (let i = 0; i < producido.length; i++) {
    noOr.push(producido[i].split("|"));
  }

  for (let i = 0; i < noOr.length; i++) {
    for (let j = 0; j < noOr[i].length; j++) {
      termyNoTerm.push(noOr[i][j].split(" "));
    }
  }

  for (let i = 0; i < termyNoTerm.length; i++) {
    let aux = termyNoTerm[i];
    for (let j = 0; j < aux.length; j++) {
      if (esNoTerminal(aux[j]) && !noTerminales.includes(aux[j])) {
        noTerminales.push(aux[j]);
      } else if (!esNoTerminal(aux[j]) && !terminales.includes(aux[j])) {
        terminales.push(aux[j]);
      } else if (aux[j].includes("'") && !noTerminales.includes(aux[j])) {
        noTerminales.push(aux[j]);
      } else if (!terminales.includes("λ")) {
        terminales.push("λ");
      }
    }
  }
}

function buscarPrimeros(line) {
  let [productor, producido] = line.split("->");
  let produccion = producido.split("|");
  let noEspacios = [];
  let prim = [];
  let ultimo = [];
  prodPrimeros.push(productor);

  for (let i in produccion) {
    noEspacios.push(produccion[i].split(" "));
  }
  for (let p in noEspacios) {
    for (let j in terminales) {
      if (
        noEspacios[p][0] === terminales[j] &&
        prim.includes(noEspacios[p][0]) === false
      ) {
        if (
          (noEspacios[p][0] !== "λ" &&
            noEspacios[p][0].toLowerCase() !== "lambda") ||
          noEspacios[p].length === 1
        ) {
          prim.push(noEspacios[p][0]);
        } else {
          if (
            terminales.includes(noEspacios[p][1]) === true &&
            prim.includes(noEspacios[p][1]) === false
          ) {
            prim.push(noEspacios[p][1]);
          }
          if (noTerminales.includes(noEspacios[p][1])) {
            for (let k in grammLL1) {
              if (noEspacios[p][1] === grammLL1[k][0]) {
                buscarPrimeros(grammLL1[k]);
                prodPrimeros.pop();
                return;
              }
            }
          }
        }
      }
    }
    if (noTerminales.includes(noEspacios[p][0]) === true) {
      for (let k in grammLL1) {
        if (noEspacios[p][0] === grammLL1[k][0]) {
          buscarPrimeros(grammLL1[k]);
          prodPrimeros.pop();
          ultimo = primeros[primeros.length - 1];
        }
      }
    }
  }
  if (ultimo[0] != null) {
    for (let i in prim) {
      if (prim[0] !== null && ultimo.includes(prim[i]) === false) {
        primeros[primeros.length - 1].push(prim);
        return;
      }
    }
    return;
  }

  if (prim[0] != null) {
    primeros.push(prim);
  } else {
    prodPrimeros.pop();
  }
}

function buscarSiguientes(line, productorB) {
  let sig = [];
  let [productor, producido] = line.split("->");
  let produccion = producido.split("|");
  let noEspacios = [];
  let posProductor = 0;
  let contador = 0;
  let prims = [];
  for (i in prodPrimeros) {
    if (productor == prodPrimeros[i]) {
      posProductor = i;
    }
  }
  for (i in produccion) {
    noEspacios.push(produccion[i].split(" "));
  }
  for (i in noEspacios) {
    if (noEspacios[i].includes(productorB) == true) {
      for (j in noEspacios[i]) {
        contador++;
        if (noEspacios[i][j] == productorB) {
          for (k in siguientes) {
            if (
              j == noEspacios[i].length - 1 &&
              sig.includes(siguientes[posProductor][k]) == false
            ) {
              sig.push(siguientes[posProductor]);
              sig = sig.flat();
            }
            if (j <= noEspacios[i].length - 2) {
              if (
                noEspacios[i][contador] == "λ" &&
                sig.includes(siguientes[posProductor][k]) == false
              ) {
                console.log("falle maestro");
                sig.push(siguientes[posProductor]);
                sig = sig.flat();
              }
              if (
                terminales.includes(noEspacios[i][contador]) &&
                sig.includes(noEspacios[i][contador]) == false
              ) {
                sig.push(noEspacios[i][contador]);
                sig = sig.flat();
              }
              if (noTerminales.includes(noEspacios[i][contador])) {
                for (l in prodPrimeros) {
                  for (m in primeros[l]) {
                    if (
                      prodPrimeros[l] == noEspacios[i][contador] &&
                      prims.includes(primeros[l][m]) == false
                    ) {
                      console.log("Sere yo maestro: ", primeros[l][m]);
                      prims.push(primeros[l][m]);
                      prims = prims.flat();
                      if (
                        prims.includes("λ") &&
                        prims.includes(siguientes[l][m]) == false
                      ) {
                        console.log("No, yo te falle");
                        prims.push(siguientes[l]);
                      } else {
                        sig.push(prims);
                        sig = sig.flat();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (siguientes.length == 0) {
    sig.push("$");
  }

  if (sig[0] != null) {
    siguientes.push(sig);
  }
}
function buscarCP(line) {
  let [productor, producido] = line.split("->");
  let produccion = producido.split("|");
  let noEspacios = [];
  for (i in produccion) {
    noEspacios.push(produccion[i].split(" "));
  }
  for (i in noEspacios) {
    if (mapa.has(productor) == false) {
      mapa.set(productor, []);
    }
    if (
      terminales.includes(noEspacios[i][0]) == true &&
      noEspacios[i][0] != "λ"
    ) {
      console.log(
        "CP: ",
        productor,
        "→",
        noEspacios[i],
        "Prim(",
        noEspacios[i],
        ")",
        " = ",
        "{",
        noEspacios[i][0],
        "}"
      );
      mapa.get(productor).push(noEspacios[i][0]);
    } else if (noEspacios[i][0] == "λ" && primeros[i].includes("λ")) {
      console.log(
        "CP: ",
        productor,
        "→",
        noEspacios[i],
        "Prim(",
        noEspacios[i],
        ")",
        " = ",
        "{",
        siguientes[i],
        "}"
      );
      mapa.get(productor).push(siguientes[i]);
    } else if (noTerminales.includes(noEspacios[i][0]) == true) {
      console.log(
        "CP: ",
        productor,
        "→",
        noEspacios[i],
        "Prim(",
        noEspacios[i],
        ")",
        " = ",
        "{",
        primeros[i],
        "}"
      );
      for (j in primeros[i]) {
        mapa.get(productor).push(primeros[i][j]);
      }
    }
  }
}

function first(gramm) {
  for (let line in gramm) {
    buscarPrimeros(gramm[line]);
  }
  for (let i in prodPrimeros) {
    listaPrimeros.push(`Prim( ${prodPrimeros[i]} ) -> ${primeros[i]}`);
  }
}

function second(gramm) {
  for (let i in prodPrimeros) {
    for (let line in gramm) {
      buscarSiguientes(gramm[line], prodPrimeros[i]);
    }
  }
  for (let i in prodPrimeros) {
    listaSiguientes.push(`Sig( ${prodPrimeros[i]} ) -> ${siguientes[i]}`);
  }
}

function cp(gramm) {
  for (line in gramm) {
    buscarCP(gramm[line]);
  }
}

function verificarLL1() {
  for (let clavevalor of mapa.entries()) {
    let letrasDuplicadas = clavevalor[1].filter((elemento, index) => {
      return clavevalor[1].indexOf(elemento) !== index;
    });
    if (letrasDuplicadas != "") {
      flag = false;
    }
  }
  if (flag == false) {
    console.log("La gramm no es LL1 ");
  } else {
    console.log("La gramm es LL1 ");
  }
}

function extendGramm(gramm) {
  for (let i = 0; i < gramm.length; i++) {
    let [productor, produccion] = gramm[i].split("->");
    let newProducction = produccion.split("|");
    for (let j = 0; j < newProducction.length; j++) {
      if (grammLR0.length === 0) {
        addNewProducction(gramm);
      }
      grammLR0.push(`${productor}->.${newProducction[j]}`);
    }
  }
}

function addNewProducction(gramm) {
  if (gramm[0][0] != "S") {
    grammLR0.push(`S->.${gramm[0][0]}`);
  } else {
    grammLR0.push(`N->.${gramm[0][0]}`);
  }
}

function parserLR0(gramlr0) {
  let canonica = gramlr0;
  let actualState = {};
  let allState = [];
  // Agrega el primer estado
  if (allState.length === 0 && Object.entries(actualState).length === 0) {
    let state = {};
    state.Estado = 0;
    state.SigTransiciones = nextTransiciones(canonica);
    state.Contenido = canonica;
    actualState = state;
    allState.push(state);
  }
  // Agrega del estado del 1 al 5
  const fillStates = () => {
    let auxContent = [];
    let nextTran = [];
    let sAcepted = "";
    let numState = allState[allState.length - 1].Estado;
    for (let i = 0; i < actualState.SigTransiciones.length; i++) {
      let transicion = actualState.SigTransiciones[i];
      for (let j = 0; j < actualState.Contenido.length; j++) {
        let line = actualState.Contenido[j];
        let [product, producci] = line.split("->");
        let separete = producci.split(" ");
        for (let k = 0; k < separete.length; k++) {
          let auxdot = "";
          if (separete[k].includes(`.${transicion}`)) {
            auxdot = moveDot(line, transicion);
            if (auxdot.includes(" ")) {
              auxdot = moveDot(auxdot, " ");
              auxContent.push(auxdot);
            } else {
              auxContent.push(auxdot);
            }
            sAcepted = isAceptedState(auxdot);
          }
        }
      }
      numState = numState + 1;
      nextTran = nextTransiciones(auxContent);
      let state = {
        Estado: numState,
        EstadoAceptacion: sAcepted,
        EstadoAnterior: actualState.Estado,
        SigTransiciones: nextTran,
        Transicion: transicion,
        Contenido: auxContent,
      };
      allState.push(state);
      sAcepted = "";
      auxContent = [];
    }
  };
  fillStates();
  const nextStates = () => {
    let nexContent = [];
    let copyStates = allState;
    let nextTran = [];
    let sAcepted = "";
    let lastState = allState[allState.length - 1].Estado;
    for (let i = 0; i < copyStates.length; i++) {
      if (copyStates[i].Estado !== 0) {
        for (let j = 0; j < copyStates[i].SigTransiciones.length; j++) {
          let transicion =
            copyStates[i].SigTransiciones[j].length === 0
              ? []
              : copyStates[i].SigTransiciones[j];
          for (let k = 0; k < copyStates[i].Contenido.length; k++) {
            let line = copyStates[i].Contenido[k];
            let [product, producci] = line.split("->");
            let separete = producci.split(" ");
            for (let x = 0; x < separete.length; x++) {
              let auxdot = "";
              if (separete[x].includes(`.${transicion}`)) {
                auxdot = moveDot(line, transicion);
                let posDot = auxdot.indexOf(".");
                if (auxdot[posDot + 1] === " ") {
                  auxdot = moveDot(auxdot);
                  nexContent.push(auxdot);
                } else {
                  nexContent.push(auxdot);
                }
                sAcepted = isAceptedState(auxdot);
              }
            }
          }
          lastState = lastState + 1;
          nextTran = nextTransiciones(nexContent);
          let state = {
            Estado: lastState,
            EstadoAceptacion: sAcepted,
            EstadoAnterior: copyStates[i].Estado,
            SigTransiciones: nextTran,
            Transicion: transicion,
            Contenido: nexContent,
          };
          allState.push(state);
          nexContent = [];
          sAcepted = "";
        }
      }
    }
  };
  nextStates();
  console.log(allState);
  return allState;
}

function moveDot(line, transicion) {
  let auxline = line.replace(`.${transicion}`, `${transicion}.`);
  return auxline;
}

function moveDotafter(line) {
  return line.replace(/\.\s/g, " .");
}

function isAceptedState(line) {
  if (line[line.length - 1] === ".") {
    return "Accepted";
  } else {
    return undefined;
  }
}

function nextTransiciones(estado) {
  let transiciones = [];
  for (let i = 0; i < estado.length; i++) {
    let [produc, line] = estado[i].split("->");
    let separete = line.split(" ");
    for (let j = 0; j < separete.length; j++) {
      if (
        separete[j].includes(".") &&
        separete[j].indexOf(".") !== separete[j].length - 1
      ) {
        if (
          !transiciones.includes(separete[j].replace(".", "")) ||
          transiciones.length === 0
        ) {
          transiciones.push(separete[j].replace(".", ""));
        }
      }
    }
  }
  return transiciones;
}

function searchProducctiosn(gramm, char) {
  let producciones = [];
  for (let i = 0; i < gramm.length; i++) {
    let [product, produccion] = gramm[i].split("->");
    if (char === product && noTerminales.includes(char)) {
      producciones.push(gramm[i]);
    }
  }
  return producciones;
}

function tracing(states) {
  let tracingAll = [];
  let numAcceptedState = 0;
  for (let i = 0; i < states.length; i++) {
    let tracingUnit = {};
    if (states[i].Estado !== 0) {
      tracingUnit.origen = `I${states[i].EstadoAnterior}`;
      tracingUnit.destino = `I${states[i].Estado}`;
      tracingUnit.transicion = states[i].Transicion;
      if (states[i].EstadoAceptacion === "Accepted") {
        tracingUnit.EstadoAceptado = `R${numAcceptedState}`;
        numAcceptedState++;
      } else {
        tracingUnit.EstadoAceptado = undefined;
      }
      tracingAll.push(tracingUnit);
    }
  }
  return tracingAll;
}

separador(gramm);
organizarGramatica(gramm);
console.log("---------Terminales--------");
console.log(terminales);
console.log("---------No Terminales--------");
console.log(noTerminales);
console.log("--------- LL1 ---------------");
console.log(grammLL1);
console.log("-----------Terminales y no Terminales de LL1");
separador(grammLL1);
console.log(terminales);
console.log(noTerminales);
console.log("---------Primeros---------");
first(grammLL1);
for (i in prodPrimeros) {
  console.log(`Prim(${prodPrimeros[i]}) -> ${primeros[i]}`);
}
console.log("-----------------Siguientes--------------------");
second(grammLL1);
for (i in prodPrimeros) {
  console.log(`Sig(${prodPrimeros[i]}) -> ${siguientes[i]}`);
}
console.log("-----------------Conjunto Prediccion--------------------");
cp(grammLL1);

console.log("-----------------verificar LL1--------------------");
verificarLL1();
//console.log("aqui sig: ",listaSiguientes)

console.log("-----------Gramatica extendida ------------");
extendGramm(gramm);
console.log(grammLR0);

console.log("------------Estados --------------");
let estados = parserLR0(grammLR0);
console.log("------------Transiciones---------");
console.log(tracing(estados));
