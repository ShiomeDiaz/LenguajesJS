let gramm = ["S->A sp s p|A sp t|A sp", "A->λ|c D|if"];
//let gramm = ["S->S ps t|T t|if", "T->as|if|λ"];["S->A sp s p|A sp t|A sp", "A->λ|c D|if"]
/*
let gramm = [
  "I->if ( comp ) { instr }|if ( comp ) { instr } else { instr }",
  "A->]|sp if|comp",
];
*/
let produce = "->";
let productores = [];
let producto = [];

let sinOr = [];
let termAndNoTerm = [];

let terminales = [];
let noTerminales = [];

let grammLL1 = [];

let primeros = [];
let prodPrimeros = [];
let siguientes = [];

let flag = true;
let mapa= new Map();

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
/** 
 *X → y1,y2,y3.yk ---- y1..k → terminales o noTerminales

    Prim(x) →
        si y1 es terminal, entonces agregar y1 a prim(x)
        si y1 no es terminal, entonces agregar prim(y1) a prim(x)
        si y1 es A, entonces agregar prim(y2) a prim(x)
        si y1 hasta yk tiene A, entonces agregar A a prim(x)
 */
        function buscarPrimeros(line) {
          let [productor, producido] = line.split("->");
          let produccion = producido.split("|");
          let noEspacios = [];
          let prim = [];
          let ultimo = []
          prodPrimeros.push(productor);
        
          for (i in produccion) {
            noEspacios.push(produccion[i].split(" "));
          }
          for (p in noEspacios) {
            for (j in terminales) {
              if (noEspacios[p][0] == terminales[j] && prim.includes(noEspacios[p][0]) == false) {
                if (noEspacios[p][0] != "λ" && noEspacios[p][0].toLowerCase() != "lambda" || noEspacios[p].length == 1) {
                  prim.push(noEspacios[p][0]);
                } else {
                  if (terminales.includes(noEspacios[p][1]) == true && prim.includes(noEspacios[p][1]) == false) {
                    prim.push(noEspacios[p][1]);
                  }
                  if (noTerminales.includes(noEspacios[p][1])) {
                    for (k in grammLL1) {
                      if (noEspacios[p][1] == grammLL1[k][0]) {
                        buscarPrimeros(grammLL1[k]);
                        prodPrimeros.pop()
                        return
                      }
                    }
        
                  }
                }
              }
        
            }
            if (noTerminales.includes(noEspacios[p][0]) == true) {
              for (k in grammLL1) {
                if (noEspacios[p][0] == grammLL1[k][0]) {
                  buscarPrimeros(grammLL1[k]);
                  prodPrimeros.pop()
                  ultimo = primeros[primeros.length - 1]
        
                }
              }
            }
          }
          if (ultimo[0] != null) {
            for (i in prim) {
              if (prim[0] != null && ultimo.includes(prim[i]) == false) {
                primeros[primeros.length - 1].push(prim)
                return
              }
            }
            return
          }
        
          if (prim[0] != null) {
            primeros.push(prim);
          } else {
            prodPrimeros.pop()
          }
        
        }
        /** 
         *A → aXB
         *Sig(x) →
                si x es la producion inicial agregar $ a los Sig(x)
                si ß es terminal, entonces agregar ß a Sig(x)
                si ß no es terminal entonces agregar Sig(x) prim(ß)
                si ß es λ, entonces agregar a Sig(x) los sig(A)
        
         */
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
              posProductor = i
            }
          }
        
          for (i in produccion) {
            noEspacios.push(produccion[i].split(" "));
          }
          for (i in noEspacios) {
            if (noEspacios[i].includes(productorB) == true) {
              for (j in noEspacios[i]) {
                contador++
                if (noEspacios[i][j] == productorB) {
                  for (k in siguientes) {
                    if (j == noEspacios.length - 1 && sig.includes(siguientes[posProductor][k]) == false) {
                      sig.push(siguientes[posProductor])
                      sig = sig.flat()
                    } if (j <= noEspacios[i].length - 2) {
                      if (noEspacios[i][contador] == "λ" && sig.includes(siguientes[posProductor][k]) == false) {
                        sig.push(siguientes[posProductor])
                        sig = sig.flat()
                      }
                      if (terminales.includes(noEspacios[i][contador]) && sig.includes(noEspacios[i][contador]) == false) {
                        sig.push(noEspacios[i][contador])
                        sig = sig.flat()
                      }
                      if (noTerminales.includes(noEspacios[i][contador])) {
                        for (l in prodPrimeros) {
                          for (m in primeros[l]) {
                            if (prodPrimeros[l] == noEspacios[i][contador] && prims.includes(primeros[l][m]) == false) {
                              prims.push(primeros[l][m])
                              prims = prims.flat()
                              if (prims.includes("λ") && prims.includes(siguientes[l][m]) == false) {
                                prims.push(siguientes[l])
                              }
                              else {
                                sig.push(prims)
                                sig = sig.flat()
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
            sig.push("$")
          }
          if (sig[0] != null) {
            siguientes.push(sig)
          }
        }
        /** 
         *Cp (A → a)=Prim(a)
         *si λ E Prim(a) entonces agregar Sig(A)
         se pregunta por la posicion 0 si es noTerminales se trae su prim
         si es terminales su prim es terminales
         */
         function buscarCP(line){
              
          let [productor, producido] = line.split("->");
          let produccion = producido.split("|");
          let noEspacios = [];
          for (i in produccion) {
            noEspacios.push(produccion[i].split(" "));
          }
          for (i in noEspacios){
            if (mapa.has(productor)== false){
                mapa.set(productor, [])
            }
              if(terminales.includes(noEspacios[i][0])== true&&noEspacios[i][0]!="λ"){
                console.log("CP: ",productor, "→", noEspacios[i], "Prim(", noEspacios[i],")"," = ", "{",noEspacios[i][0], "}")
                mapa.get(productor).push(noEspacios[i][0]);
        
              }
              else if (noEspacios[i][0]=="λ"&& primeros[i].includes("λ")){
                console.log("CP: ",productor, "→", noEspacios[i], "Prim(", noEspacios[i],")"," = ", "{",siguientes[i], "}")
                mapa.get(productor).push(siguientes[i]);
              }
              else if(noTerminales.includes(noEspacios[i][0])==true){
                console.log("CP: ",productor, "→", noEspacios[i], "Prim(", noEspacios[i],")"," = ", "{",primeros[i], "}")
                for( j in primeros[i]){
                    mapa.get(productor).push(primeros[i][j]);
                }
              }
            }
          }
          for (line in grammLL1) {
            buscarPrimeros(grammLL1[line]);
        
          }
          for (let i = 0; i < prodPrimeros.length; i++) {
            for (let line = 0; line < grammLL1.length; line++) {
              buscarSiguientes(grammLL1[line], prodPrimeros[i]);
            }
          }
        
        
        console.log("---------------gramm LL1-----------------")
console.log(grammLL1)

console.log("-----------------Primeros--------------------")
for (var i = 0; i < prodPrimeros.length; i++) {
  console.log("Prim(" + prodPrimeros[i] + ") → " + primeros[i])
}
console.log(primeros)
console.log("-----------------Siguientes--------------------")
for (i in prodPrimeros) {
  console.log("Sig(" + prodPrimeros[i] + ") → " + siguientes[i])
}
console.log(siguientes)
for (line in grammLL1){
  buscarCP(grammLL1[line]);
}
function verificarLL1(){
  for (let clavevalor of mapa.entries()) {
    let letrasDuplicadas = clavevalor[1].filter((elemento, index) => {
        return clavevalor[1].indexOf(elemento) !== index;});
    //console.log(clavevalor[1]);
    if (letrasDuplicadas != ""){
        flag = false;
        //console.log(letrasDuplicadas);
    }
    
  }


  if(flag==false){
    //console.log("La gramm no es LL1 ya que se repite en la produccion : ", productor, "→ ", noEspacios[i][0])
    console.log("La gramm no es LL1 ")
  }else{
    console.log("La gramm es LL1 ")
  }
}

verificarLL1()