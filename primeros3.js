
/*
    La alimentacion parte de un arreglo de Strings
*/
let gramm = ["S->T S'|if S'", "S'->ps S'", "T->as|if|λ"];
let produce = "->";
/*
    Se puede decir que es la gramm final
*/
let grammLL1 = [];
let terminales = [];
let noTerminales = [];
let primeros = [];
let prodPrimeros = [];
let siguientes = [];
let productores = [];
let producto = [];
let sinOr = [];
let termAndNoTerm = [];
let flag = true;
let mapa= new Map();
/*
/*
    La recurcion izquierda se ve cuando la porduccion de una gramm
    se produce a si misma como en el ejemplo de la gramm anterior 
            S->S|T
    Lo que hace el metodo es que le entra un string (o la linea de la
    gramm) y compara la produccion con el primer caracter que no 
    sea un no terminal y que sea el mismo que el que produce.
    Por eso se una el operador "===" para que compara y sea exacatemente
    igual
*/
function recurcionIzquierda(line) {
  if (line) {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ">") {
        if (line[0] === line[i + 1]) {
          console.log("si tiene recurcion");
          return true;
        } else {
          return false;
        }
      }
    }
  }
}
/*
    El funcionamiento de esta funcuion es a partir de una 
    de las lineas del arreglo

    1. Se divide el la produccion del producido 
    por medio de la funcion .split y se almacena en cada
    variable con el expres operator que se muestra en la primera
    linea de la funcion, despues
       pasa de: 
                "S->S ps|T|if
        a esto :
                productor: S : type String
                producido: S ps|T|if : type String
    y se elimina el simbolo de produce "->"

    2. Ahora se divide lo producido por su simbolo que es 
       el OR "|" para tener en un arreglo de cada parte de la produccion
       entonces pasa de: 
                S ps|T|if : type String
        a esto: 
                produccion = ['S ps', 'T', 'if']

    3. En este paso se recoccre produccion y con la funcion .split
        le quitamos los espacion y la agregamos
        a noEspacios que es una array (hay que ponerle un nombre mas 
        adecuado)
        Queda de la forma: 
            noEspacios= [['S', 'ps'],['T'],['if']]

    4. Ahora se recorre noEspacios de atras hacia adelante
       se hace por la formula de la recurcion izq
            A -> Aa1 | Aa2 | ... | Aam | B1 | B2 | ... | Bn

            A -> B1A' | B2A' | BnA'
            A' -> a1A' | a2A' | ... | amA' | lambda
        se puede observar que la primera produccion son los Bn
        entonces se recorre asi.

        Se pregunta si no es igual al productor o si no esta el producto 
        y se hace la primera produccion de las betas y se pregunta si esta el prodcuto
        y se hace la produccion de A' y se agrega a un arreglo como la gramm final.
            
*/
/*
    lo unico que falta solucionar es que en el nuevo 
    productor para eliminar la recurcion no me aparece el 
    " ' " para que se pueda identirficar bien 
*/
function eliminarRecurcionIzq(line) {
  let [productor, producido] = line.split("->");
  let newProductor = productor + "'";
  let produccion = producido.split("|");
  let noEspacios = [];
  console.log(newProductor);
  for (i in produccion) {
    noEspacios.push(produccion[i].split(" "));
  }
  for (let i = noEspacios.length - 1; i >= 0; i--) {
    for (j in noEspacios[i]) {
      if (noEspacios[i][j] != productor) {
        grammLL1.push(
          productor + produce + noEspacios[i][j] + " " + newProductor
        );
      }
      if (noEspacios[i][j + 1] === productor) {
        grammLL1.push(
          `${newProductor}${produce}${noEspacios} ${newProductor}|λ`
        );
        break;
      }
    }
  }
}


/**
 * -------------------Obtener terminales = Terminales y noTerminales = no Terminales----------
    se obtienen ingresando como parametro un gramm[line], comparando las posiciones del array con su version
    mayuscula para No terminales y minuscula para terminales ademas de comprobar si ya existen mediante includes()
    para evitar repetir información. para noTerminales hace falta el productor que es el inicial y se lo agregamos en el segundo if().
 */
function conjuntoTN(line) {
  let [productor, producido] = line.split("->");
  let produccion = producido.split("|");
  let noEspacios = [];
  for (i in produccion) {
    noEspacios.push(produccion[i].split(" "))
  }
  for (i in noEspacios) {
    for (j in noEspacios[i]) {
      if (noEspacios[i][j] == noEspacios[i][j].toUpperCase() && noTerminales.includes(noEspacios[i][j]) == false) {
        noTerminales.push(noEspacios[i][j]);
      }
      if (noTerminales.includes(productor) == false) {
        noTerminales.push(productor);
      }
      if (noEspacios[i][j] == noEspacios[i][j].toLowerCase() && terminales.includes(noEspacios[i][j]) == false) {
        terminales.push(noEspacios[i][j]);
      }
    }
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
      else if (noEspacios[i][0]=="λ"&&primeros[i].includes("λ")){
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


/*
Metodo main para leer la gramm y ejecutar los respectivos 
paso para poder comprobar si es una gramm ll1
*/
function leergramm(gramm) {
  for (line in gramm) {
    if (recurcionIzquierda(gramm[line])) {
      eliminarRecurcionIzq(gramm[line]);
    } else {
      grammLL1.push(gramm[line]);
    }

  }
  terminalesnoTerminales(grammLL1);
  for (line in grammLL1) {
    buscarPrimeros(grammLL1[line]);

  }
  for (let i = 0; i < prodPrimeros.length; i++) {
    for (let line = 0; line < grammLL1.length; line++) {
      buscarSiguientes(grammLL1[line], prodPrimeros[i]);
    }
  }

}
//Alimenta el conjuntoTN con el gramm[line]
function terminalesnoTerminales(gramm) {
  for (line in gramm) { conjuntoTN(gramm[line]); }
}

leergramm(gramm);
terminalesnoTerminales(gramm);
console.log("---------------gramm LL1-----------------")
console.log(grammLL1)
// console.log("Conjunto noTerminales:", noTerminales)
// console.log("Conjunto terminales:", terminales)
terminalesnoTerminales(grammLL1);
console.log("Conjunto noTerminales posLL1:", noTerminales)
console.log("Conjunto terminales posLL1:", terminales)
// console.log(grammLL1);
console.log("-----------------Primeros--------------------")
for (var i = 0; i < prodPrimeros.length; i++) {
  console.log("Prim(" + prodPrimeros[i] + ") → " + primeros[i])
}
console.log(primeros)
// console.log("Primeros ")
// console.log(primeros)
// console.log("prodPrimeros ")
// console.log(prodPrimeros)
console.log("-----------------Siguientes--------------------")
for (i in prodPrimeros) {
  console.log("Sig(" + prodPrimeros[i] + ") → " + siguientes[i])
}
console.log(siguientes)
for (line in grammLL1){
  buscarCP(grammLL1[line]);
}

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
  console.log("La gramm no es LL1 ")}