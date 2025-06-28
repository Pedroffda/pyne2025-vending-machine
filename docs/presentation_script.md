# Roteiro de Apresentação: Vending Machine Descentralizada - PyNE 2025

**Participantes:** Pedro e Maria

---

### **1. Abertura e Introdução (2 minutos)**

**(Pedro)**
> Olá, pessoal! Meu nome é Pedro...

**(Maria)**
> ...e eu sou a Maria. É um prazer estar aqui na Python Nordeste 2025!

**(Pedro)**
> Hoje, vamos apresentar um projeto que foi o resultado do nosso tutorial "Blockchain para Pythonistas": uma Vending Machine de Cupcakes totalmente descentralizada. Nós fizemos o deploy dela e vocês podem acessá-la agora mesmo neste link: [pyne2025.littoralab.com.br](https://pyne2025.littoralab.com.br/).

**(Maria)**
> Exato! Essa não é uma loja de cupcakes comum. Em vez de um servidor central controlando tudo, as regras de negócio, o estoque e as compras são gerenciadas por um Smart Contract (um contrato inteligente) que roda na blockchain Ethereum, na rede de testes Sepolia.

---

### **2. Demonstração Ao Vivo: Comprando um Cupcake (5 minutos)**

**(Maria)**
> Vamos ver como funciona na prática. *(compartilha a tela com a aplicação aberta)*.
> 
> Essa é a nossa Vending Machine. A interface é simples: à esquerda, temos as informações e ações da máquina, e à direita, os detalhes da nossa carteira.
> 
> O primeiro passo para interagir com qualquer aplicação descentralizada, ou dApp, é conectar nossa carteira digital. Vamos usar a MetaMask. Ao clicar em "Conectar Carteira"... *(clica no botão)* ...a MetaMask abre e pede nossa permissão. *(aceita a conexão)*.

**(Pedro)**
> Pronto! Conectados. Agora a aplicação consegue ler as informações do contrato diretamente da blockchain.
> 
> Vejam: a máquina tem **[mostrar o número]** cupcakes em estoque. E a nossa carteira, que acabamos de conectar, tem **[mostrar o número, provavelmente 0]** cupcakes.
> 
> Hora de comprar! Vou comprar 1 cupcake. O preço é 0.001 ETH de teste.

**(Maria)**
> Ao clicar em "Comprar"... *(clica no botão de comprar)* ...a mágica acontece. A nossa aplicação não está enviando uma requisição para um servidor tradicional. Em vez disso, ela está pedindo para a MetaMask criar, assinar e enviar uma **transação** para a blockchain.
> 
> *(mostra o pop-up da MetaMask)*
> 
> A MetaMask mostra exatamente o que estamos fazendo: chamando a função `purchase` do contrato e enviando uma pequena quantidade de ETH. Vou confirmar. *(clica em "Confirmar")*.

**(Pedro)**
> A transação foi enviada para a rede. Ela precisa ser validada e incluída em um novo bloco, o que leva alguns segundos. Enquanto isso, podemos até ver a transação pendente no Etherscan, o explorador de blocos da Ethereum.
> 
> ... E... pronto! Transação confirmada!
> 
> *(aponta para a tela)*. Vejam só: o estoque da máquina diminuiu em um, e o nosso saldo de cupcakes aumentou para um! Nós realmente *possuímos* esse cupcake digital na nossa carteira. E se eu abrir a MetaMask, vocês verão que meu saldo de ETH diminuiu um pouquinho, que foi o custo da compra mais a taxa de gás da transação.

---

### **3. Por Baixo dos Panos: O Código (3 minutos)**

**(Pedro)**
> Isso tudo parece mágico, mas é tecnologia. O nosso tutorial ensinou a criar a "alma" dessa aplicação: o Smart Contract. Ele é escrito em uma linguagem chamada Solidity.
> 
> *(mostra rapidamente o trecho do contrato em `PyNE25_tutorial.ipynb` ou um slide)*
> 
> ```solidity
> // SPDX-License-Identifier: MIT
> pragma solidity ^0.8.20;
> 
> contract VendingMachine {
>     mapping (address => uint) public cupcakeBalances;
> 
>     function purchase(uint amount) public payable {
>         require(msg.value >= amount * 0.001 ether, "Você precisa pagar o valor correto!");
>         require(cupcakeBalances[address(this)] >= amount, "Estoque insuficiente.");
>         cupcakeBalances[address(this)] -= amount;
>         cupcakeBalances[msg.sender] += amount;
>     }
> }
> ```
> Essa função `purchase` é o coração da lógica de compra. Ela verifica se o pagamento está correto, se há estoque, e então transfere os cupcakes. É um código público, auditável e que, uma vez na blockchain, não pode ser alterado.

**(Maria)**
> E no lado do frontend, usamos React com a biblioteca `ethers.js` para "conversar" com o contrato.
> 
> *(mostra rapidamente o trecho de código do `App.tsx`)*
> 
> ```typescript
> const purchaseCupcakes = async () => {
>   const amount = Number.parseInt(purchaseAmount);
>   // Converte o valor para a unidade correta (ETH)
>   const value = ethers.parseEther((amount * 0.001).toString());
>   // Chama a função 'purchase' do contrato, enviando o pagamento
>   const tx = await contract.purchase(amount, { value });
>   await tx.wait(); // Espera a transação ser minerada
>   // Atualiza a UI!
>   await loadContractData(contract, account);
> };
> ```
> Como podem ver, o código do frontend simplesmente monta a transação e a envia. Toda a lógica de negócio pesada fica no contrato, garantindo segurança e transparência.

---

### **4. Conclusão (1 minuto)**

**(Maria)**
> O que mostramos aqui é um exemplo simples, mas poderoso, do que a tecnologia blockchain permite: criar aplicações onde a confiança não é depositada em uma empresa, mas sim na lógica imutável do código.

**(Pedro)**
> O nosso tutorial na PyNE cobriu todos os passos para construir isso do zero: desde criar uma carteira, usar Python com a biblioteca `web3.py` para fazer o deploy do contrato, até construir a interface que vocês viram.
> 
> Muito obrigado pela atenção! E agora, ficamos felizes em responder qualquer pergunta que vocês tenham. 