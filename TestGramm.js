/*
    La alimentacion parte de un arreglo de Strings
*/
let gramatica = ["S->S ps|T|if", "T->as|if|lambda"];
let produce = "->";
/*
    Se puede decir que es la gramatica final
*/
let gramaticaLL1 = [];
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
  console.log(noEspacios);
  for (let i = noEspacios.length - 1; i >= 0; i--) {
    for (j in noEspacios[i]) {
      if (noEspacios[i][j] != productor) {
        gramaticaLL1.push(
          productor + produce + noEspacios[i][j] + " " + newProductor
        );
      }
      if (noEspacios[i][j + 1] === productor) {
        gramaticaLL1.push(
          `${newProductor}${produce}${noEspacios} ${newProductor}|lambda`
        );
        break;
      }
    }
  }
}

/*
Metodo main para leer la gramatica y ejecutar los respectivos 
paso para poder comprobar si es una gramatica ll1
*/
function leerGramatica(gramm) {
  for (line in gramm) {
    //separacionProducciones(gramm[line]);
    if (recurcionIzquierda(gramm[line])) {
      eliminarRecurcionIzq(gramm[line]);
    } else {
      gramaticaLL1.push(gramm[line]);
    }
  }
}

leerGramatica(gramatica);
console.log(gramaticaLL1);
