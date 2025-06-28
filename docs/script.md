# Blockchain para Pythonistas: Do Zero ao Smart Contract


### **Parte 1: Introdução ao MetaMask**

**Objetivo:** Criar uma carteira na MetaMask, adicionar saldo (faucet) e preparar o ambiente inicial.

1.  **Fazer login em uma conta Google.**
2.  **Acessar o site da [MetaMask](https://metamask.io/)** e adicionar a extensão ao seu navegador.
3.  **Criar uma nova carteira** com uma senha que você possa lembrar depois.
4.  **Pular a etapa de segurança da frase de recuperação (somente para este tutorial de teste).**
      * **Atenção:** Em um cenário real, sempre anote e guarde sua frase de recuperação em um local seguro.
5.  **Mudar a rede** de "Rede principal do Ethereum" para **"Sepolia Testnet"**.
6.  **Acessar um Faucet da Ethereum Sepolia** (por exemplo, [sepoliafaucet.com](https://sepoliafaucet.com/) ou [infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)).
7.  **Copiar o endereço (chave pública) de sua carteira** na MetaMask e usar o Faucet para receber tokens de teste.
8.  **Ao finalizar, acesse e preencha com seu endereço:** [Tutorial Python Nordeste 2025 - Mapeamento](https://www.google.com/search?q=https://forms.gle/exemplo) (Link de exemplo).

-----

### **Parte 2: Explorando Redes Públicas**

**Objetivo:** Acessar o Etherscan e explorar um ledger público da rede de testes Sepolia.

1.  **Acessar o [Etherscan para a rede Sepolia](https://sepolia.etherscan.io/)**.
2.  No canto superior direito, confirme que a rede selecionada é a **"Sepolia Testnet"**.
3.  **Identifique o número do último bloco minerado** na página principal.
4.  **Copiar sua chave pública** da carteira MetaMask e colá-la na barra de busca do Etherscan para ver os detalhes da sua conta na blockchain.

-----

### **Parte 3: Alchemy**

**Objetivo:** Criar uma conta na Alchemy e obter uma chave de API para interagir com a blockchain.

1.  **Acessar o site: [https://www.alchemy.com/](https://www.alchemy.com/)**.
2.  **Criar uma conta** (pode usar sua conta Google).
3.  No dashboard, selecione a rede **Ethereum**.
4.  Vá para a seção **‘My Apps’** e crie um novo aplicativo.
5.  **Encontre e copie sua chave de API (API Key)** para a rede Sepolia. Você usará a URL RPC.

-----

### **Parte Final: Web3.py**

**Objetivo:** Compilar e fazer o deploy do seu primeiro contrato inteligente usando Python\!

#### **Antes de Começar**

**1. Ambiente Virtual**

  * **Para Linux/Mac:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
  * **Para Windows:**
    ```bash
    python -m venv venv
    venv\Scripts\activate
    ```

**2. Instalação da biblioteca Web3**

```bash
pip install web3
```

**3. Instalação do Test Provider (eth-tester)**

```bash
pip install "web3[tester]"
```

#### **Configuração do Nó Provedor**

**1. Configuração do Test Provider (Nó "sandbox")**
Este é um nó local para testes rápidos, provido pelo `eth-tester`.

```python
from web3 import Web3, EthereumTesterProvider
w3 = Web3(EthereumTesterProvider())
print(w3.is_connected())
# Retorna: True
```

**2. Configuração de um nó remoto Sepolia**
Usaremos a URL RPC da Alchemy que você obteve.

```python
from web3 import Web3
# Substitua 'SUA_URL_RPC_DA_ALCHEMY' pela sua chave
api_url = 'SUA_URL_RPC_DA_ALCHEMY'
w3 = Web3(Web3.HTTPProvider(api_url))
print(w3.is_connected())
# Retorna: True
```

**3. Testando o provedor**

  * Listar contas (faz mais sentido com o `EthereumTesterProvider`):
    ```python
    print(w3.eth.accounts)
    ```
  * Obter o último bloco minerado na rede conectada:
    ```python
    print(w3.eth.get_block('latest'))
    ```

#### **Compilador Solidity**

**1. Instalação do gerenciador de versão para o compilador Solc**

```bash
pip install py-solc-x
```

**2. Instalação e configuração do compilador (versão 0.8.20)**

```python
from solcx import install_solc
# Instala a versão especificada
install_solc(version='0.8.20')

import solcx
# Define a versão a ser usada
solcx.set_solc_version('0.8.20')
print(solcx.get_solc_version(with_commit_hash=False))
# Retorna: <Version('0.8.20')>
```

#### **Compilar Contrato**

Você precisará do código-fonte do contrato `PyNE25_tutorial.sol` que será fornecido no notebook `PyNE25_tutorial.ipynb`.

**1. Usando o código-fonte do contrato (string)**

```python
# O código do contrato será uma string multi-linha
codigo_fonte_contrato = """
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    string public greet;

    constructor() {
        greet = "Hello World";
    }

    function setGreeting(string memory _greet) public {
        greet = _greet;
    }
}
"""

compiled_sol = solcx.compile_source(
    codigo_fonte_contrato,
    output_values=["abi", "bin"],
    solc_version="0.8.20"
)
```

**2. Usando um arquivo-fonte**

```python
# Supondo que o arquivo .sol está no mesmo diretório
compiled_sol = solcx.compile_files(
    ["PyNE25_tutorial.sol"],
    output_values=["abi", "bin"],
    solc_version="0.8.20"
)
```

#### **Fazer Deploy do Contrato**

  * Esta seção será detalhada no notebook `PyNE25_tutorial.ipynb`. Os passos gerais são:
    1.  Obter o `bytecode` e `ABI` da compilação.
    2.  Configurar a sua conta (usando a chave privada da MetaMask).
    3.  Construir e assinar a transação de deploy.
    4.  Enviar a transação para a rede Sepolia.

#### **Interagir com o Contrato**

  * Esta seção será detalhada no notebook `PyNE25_tutorial.ipynb`. Os passos gerais são:
    1.  Criar uma instância do contrato em Python usando o endereço do contrato e a `ABI`.
    2.  Chamar as funções de leitura (ex: `greet()`).
    3.  Construir, assinar e enviar transações para chamar funções de escrita (ex: `setGreeting()`).

-----

**Próximo passo: Abra o `PyNE25_tutorial.ipynb` para continuar\!**