# 🧁 Cupcake Vending Machine dApp

Bem-vindo à Cupcake Vending Machine, uma aplicação descentralizada (dApp) construída sobre a blockchain Ethereum. Esta interface web permite que os usuários interajam com um contrato inteligente de máquina de venda de cupcakes de forma simples e intuitiva.

## ✨ Funcionalidades

- **Conexão com Carteira:** Conecte-se facilmente usando a MetaMask ou outra carteira Ethereum via `window.ethereum`.
- **Visualização de Saldo:** Veja quantos cupcakes você possui e quantos estão disponíveis na máquina.
- **Compra de Cupcakes:** Compre cupcakes pagando em ETH (o preço é definido no contrato inteligente, atualmente `0.001 ETH`).
- **Reabastecimento para o Dono:** O proprietário do contrato pode reabastecer o estoque de cupcakes da máquina.
- **Troca Dinâmica de Máquina:** Conecte-se e interaja com diferentes instâncias do contrato da Vending Machine simplesmente colando o endereço do contrato.
- **Feedback em Tempo Real:** Receba notificações (toasts) para o status de suas transações (sucesso, erro, pendente).
- **Interface Moderna:** Construída com Next.js, TypeScript, Tailwind CSS e shadcn/ui para uma experiência de usuário agradável e responsiva.

## 🚀 Tecnologias Utilizadas

- **Frontend:** [React](https://reactjs.org/) (com [Next.js](https://nextjs.org/))
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Interação com Blockchain:** [Ethers.js](https://ethers.io/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Notificações:** [Sonner](https://sonner.emilkowal.ski/)
- **Blockchain:** [Solidity](https://soliditylang.org/) (para o contrato inteligente)

## 🔧 Pré-requisitos

Antes de começar, você precisará ter o seguinte software instalado:

- [Node.js e npm](https://nodejs.org/en/) (v18 ou superior)
- [MetaMask](https://metamask.io/) (extensão para o seu navegador)
- Um ambiente de desenvolvimento para Ethereum como [Hardhat](https://hardhat.org/) ou [Ganache](https://trufflesuite.com/ganache/) (para deploy local do contrato)

## ⚙️ Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd vending-machine
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    - Crie um arquivo chamado `.env`.
    - Adicione a seguinte linha, substituindo pelo endereço do seu contrato deployado:
      ```
      NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS="0xSEU_ENDERECO_DE_CONTRATO_AQUI"
      ```

4.  **Deploy do Contrato Inteligente (se necessário):**
    - Se você ainda não o fez, compile e faça o deploy do seu contrato `VendingMachine.sol` em uma rede de teste ou local. Use o endereço gerado no passo anterior.

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

6.  **Abra no navegador:**
    - Acesse [`http://localhost:3000`](http://localhost:3000) no seu navegador.

## 🎮 Como Usar

1.  **Conecte a Carteira:**
    - Certifique-se de que sua MetaMask está conectada à mesma rede onde o contrato foi deployado.
    - Clique no botão "Conectar Carteira".

2.  **Interaja com a Máquina:**
    - Após conectar, a interface mostrará o estoque da máquina, seu saldo de cupcakes e seu endereço.
    - Se você for o proprietário do contrato, um selo de "Proprietário" e o painel de reabastecimento aparecerão.

3.  **Compre Cupcakes:**
    - No card "Comprar Cupcakes", insira a quantidade desejada.
    - O custo total será calculado automaticamente.
    - Clique em "Comprar" e confirme a transação na MetaMask.

4.  **Reabasteça (Apenas Dono):**
    - No card "Reabastecer Máquina", insira a quantidade a ser adicionada ao estoque.
    - Clique em "Reabastecer" e confirme a transação.

5.  **Troque de Máquina:**
    - No card "Trocar de Máquina", cole o endereço de outro contrato de Vending Machine.
    - Clique em "Carregar Máquina". A interface será atualizada para refletir os dados do novo contrato.
