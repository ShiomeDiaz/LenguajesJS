
class Gramatica:
    def __init__(self, gramm) -> None:
        self.gramm = gramm
        self.grammLr0 = []
        self.term = []
        self.noTerm = []

    def extractNewGramm(self):
        for line in self.gramm:
            productor, producido = line.split("->")
            newProductos = producido.split("|")
            for p in newProductos:
                if self.grammLr0 == []:
                    self.addNewProducction()
                self.grammLr0.append(f'{productor}->.{p}')

    def addNewProducction(self):
        if self.gramm[0][0] != 'S':
            self.grammLr0.append(f'S->.{self.gramm[0][0]}')
        else:
            self.grammLr0.append(f'N->.{self.gramm[0][0]}')

    def extractTermsAndNoterms(self):
        productores = []
        producido = []
        noOr = []
        termyNoterm = []
        for line in self.gramm:
            productor, producto = line.split('->')
            productores.append(productor)
            if(productor not in self.noTerm):
                self.noTerm.append(productor)
            producido.append(producto)

        for part in producido:
            noOr.append(part.split('|'))

        for i in noOr:
            for j in i:
                termyNoterm.append(j.split(" "))

        for i in termyNoterm:
            aux = i
            for j in aux:
                if j.isupper() and j not in self.noTerm:
                    self.noTerm.append(j)
                elif not j.isupper() and j not in self.term:
                    self.term.append(j)
                elif j.endswith("'") and j not in self.noTerm:
                    self.noTerm.append(j)
                elif "λ" not in self.term:
                    self.term.append('λ')

    def searchProductions(self, productor, state):
        productions = []
        for line in state:
            prod, produc = line.split('->')
            if productor == prod and productor in self.noTerm:
                productions.append(line)

        return productions

    def parserLr0(self):
        canonica = self.grammLr0
        actualState = []
        newState = []
        allStates = []
        if actualState == [] and newState == [] and allStates == []:
            state = {}
            state['Estado'] = 'i0'
            state['Content'] = canonica
            allStates.append(state)

        for line in canonica:
            # Para la primera iteracion
            # aux no saca el index donde se encuentra el punto
            aux = line.find('.')
            if line[aux + 1] in self.noTerm:
                # Siguientes 2 lineas de codigo funcionan para mover el .
                lineaux = line.replace('.', '')
                lineaux = lineaux.replace(lineaux[aux], f'{lineaux[aux]}.')
                newState.append(lineaux)
                print(lineaux)
                print(self.searchProductions(line[aux+1], canonica))
            else:
                print('siguiente terminal')


if __name__ == '__main__':
    gramm = Gramatica(["S->A sp S'", "S'->s p|t|λ", 'A->λ|c d|if'])
    gramm.extractNewGramm()
    print("-------Gramatica organizada para lr0-----")
    for i in gramm.grammLr0:
        print(i)
    gramm.extractTermsAndNoterms()
    print("---------Terminales---------")
    print(gramm.term)
    print("---------No Terminales------")
    print(gramm.noTerm)
    print("----------Automata con los estados -------------")
    gramm.parserLr0()
