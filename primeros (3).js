
/*
    La alimentacion parte de un arreglo de Strings
*/
let gramatica = ["S->S ps|T|if", "T->as|if|λ"];
let produce = "->";
/*
    Se puede decir que es la gramatica final
*/
let gramaticaLL1 = [];
let VT = [];
let VN = [];
var primeros=[];
var prodPrimeros=[];
var siguientes=[];
/*
    La recurcion izquierda se ve cuando la porduccion de una gramatica
    se produce a si misma como en el ejemplo de la gramatica anterior 
            S->S|T
    Lo que hace el metodo es que le entra un string (o la linea de la
    gramatica) y compara la produccion con el primer caracter que no 
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
        y se hace la produccion de A' y se agrega a un arreglo como la gramatica final.
            
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
        gramaticaLL1.push(
          productor + produce + noEspacios[i][j] + " " + newProductor
        );
      }
      if (noEspacios[i][j + 1] === productor) {
        gramaticaLL1.push(
          `${newProductor}${produce}${noEspacios} ${newProductor}|λ`
        );
        break;
      }
    }
  }
}


/**
 * -------------------Obtener vt = Terminales y VN = no Terminales----------
    se obtienen ingresando como parametro un Gramatica[line], comparando las posiciones del array con su version
    mayuscula para No terminales y minuscula para terminales ademas de comprobar si ya existen mediante includes()
    para evitar repetir información. para VN hace falta el productor que es el inicial y se lo agregamos en el segundo if().
 */
function conjuntoTN(line) {
    let [productor, producido] = line.split("->");
    let produccion = producido.split("|");
    let noEspacios = [];
    for (i in produccion) {
      noEspacios.push(produccion[i].split(" "))
    }
    for (i in noEspacios) {
        for( j in noEspacios[i]){
            if (noEspacios[i][j] == noEspacios[i][j].toUpperCase()&& VN.includes(noEspacios[i][j])== false){
              VN.push(noEspacios[i][j]);
             }
            if(VN.includes(productor)== false){
                VN.push(productor);
            }
            if ( noEspacios[i][j] == noEspacios[i][j].toLowerCase()&& VT.includes(noEspacios[i][j])== false) { 
              VT.push(noEspacios[i][j]);
             } 
          }
      }
}
/** 
 *X → y1,y2,y3.yk ---- y1..k → VT o VN

    Prim(x) →
        si y1 es terminal, entonces agregar y1 a prim(x)
        si y1 no es terminal, entonces agregar prim(y1) a prim(x)
        si y1 es A, entonces agregar prim(y2) a prim(x)
        si y1 hasta yk tiene A, entonces agregar A a prim(x)
 */
function buscarPrimeros(line) { 
  //console.log(line)
  let [productor, producido] = line.split("->");
  let produccion = producido.split("|");
  let noEspacios = [];
  let prim= [];
  prodPrimeros.push(productor);

  for (i in produccion) {
    noEspacios.push(produccion[i].split(" "));
  }
  for(p in noEspacios){
    for(j in VT){
      if (noEspacios[p][0] == VT[j] && prim.includes(noEspacios[p][0]) == false){
        prim.push(noEspacios[p][0]);
      }
    }
    for (r in VN){
      if(noEspacios[p][0] == VN[r]){
        for(k in gramaticaLL1){
          if(noEspacios[p][0] == gramaticaLL1[k][0]){
            buscarPrimeros(gramaticaLL1[k]);
          }
        }  
        
      }
    }
  }
  if (prim[0] != null){
    primeros.push(prim);
  }else{
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
 function buscarSiguientes(line){
    let [productor, producido] = line.split("->");
    let produccion = producido.split("|");
    let noEspacios = [];
    let prim= [];
    //prodPrimeros.push(productor);
    
        
    for (i in produccion) {
       noEspacios.push(produccion[i].split(" "));
      //console.log("produccion ", produccion[i])
   }
   noEspacios = noEspacios.flat();
   console.log("productor",productor,"produccion", noEspacios)
   for (i = 0; i < productor.length; i++) {
    console.log("productor: ", productor[i])
    for (j = 0; j <noEspacios.length; j++) {
        if(noEspacios[j]==noEspacios[0]){
          siguientes[i][j].push()
          console.log("somos iguales:", noEspacios[j], "y....", productor[i])
        }
        
    }
   }
  //  for (i in noEspacios) {
  //    if(noEspacios[1]==productor) {
  //      console.log("somos iguales:", noEspacios[1], "y....", productor)
  //    }
     //console.log("produccion", noEspacios[1])
   // console}
   
  }


/*
Metodo main para leer la gramatica y ejecutar los respectivos 
paso para poder comprobar si es una gramatica ll1
*/
function leerGramatica(gramm) {
  for (line in gramm) {
    if (recurcionIzquierda(gramm[line])) {
      eliminarRecurcionIzq(gramm[line]);
    } else {
      gramaticaLL1.push(gramm[line]);
    }

  }
  vtvn(gramaticaLL1);
  for (line2 in gramaticaLL1){
    buscarPrimeros(gramaticaLL1[line2]);
    
  }
  for (line2 in gramaticaLL1){
    buscarSiguientes(gramaticaLL1[line2]);
}
}
//Alimenta el conjuntoTN con el Gramatica[line]
function vtvn(gramm){
    for (line in gramm) {conjuntoTN(gramm[line]);}
}

leerGramatica(gramatica);
vtvn(gramatica);
console.log("---------------Gramatica LL1-----------------")
console.log(gramaticaLL1)
// console.log("Conjunto VN:", VN)
// console.log("Conjunto VT:", VT)
// vtvn(gramaticaLL1);
// console.log("Conjunto VN posLL1:", VN)
// console.log("Conjunto VT posLL1:", VT)
// console.log(gramaticaLL1);
console.log("-----------------Primeros--------------------")
for (var i = 0; i <prodPrimeros.length; i++) {
  console.log("Prim("+prodPrimeros[i]+ ") → "+ primeros[i])
}
// console.log("Primeros ")
// console.log(primeros)
// console.log("prodPrimeros ")
// console.log(prodPrimeros)