"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import {
  Cake,
  Coins,
  Crown,
  RefreshCw,
  ShoppingCart,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

// ABI do contrato
const CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "cupcakeBalances",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "purchase",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "refill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const DEFAULT_CONTRACT_ADDRESS =
  import.meta.env.VITE_DEFAULT_CONTRACT_ADDRESS || "";

const EXAMPLE_CONTRACTS = [
  "0x142D92d6D3147a4B473935B5ec71045Bdf6DbF0E",
  "0xc96854f62b8871D10ea03499D8B95CBd335f9FF3",
  "0x5D16bb80fB0AAb4202ECC901749F4288F14D2dDc",
];

function App() {
  useState(() => {
    if (!DEFAULT_CONTRACT_ADDRESS) {
      console.error(
        "Erro: A variável de ambiente VITE_DEFAULT_CONTRACT_ADDRESS não está definida em seu arquivo .env"
      );
      toast.error("Configuração Incompleta", {
        description: "O endereço do contrato padrão não foi encontrado.",
        duration: Infinity,
      });
    }
  });

  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [activeContractAddress, setActiveContractAddress] = useState<string>(
    DEFAULT_CONTRACT_ADDRESS
  );
  const [targetContractAddress, setTargetContractAddress] =
    useState<string>("");
  const [contractBalance, setContractBalance] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [purchaseAmount, setPurchaseAmount] = useState<string>("1");
  const [refillAmount, setRefillAmount] = useState<string>("10");
  const [cupcakeAnimation, setCupcakeAnimation] = useState<boolean>(false);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        setAccount(accounts[0]);

        const contract = new ethers.Contract(
          activeContractAddress,
          CONTRACT_ABI,
          signer
        );
        setContract(contract);

        toast.success("🎉 Carteira Conectada!", {
          description: `Conectado como: ${accounts[0].slice(
            0,
            6
          )}...${accounts[0].slice(-4)}`,
        });

        await loadContractData(contract, accounts[0]);
      } else {
        toast.error("❌ MetaMask não encontrado", {
          description: "Por favor, instale o MetaMask para continuar",
        });
      }
    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
      toast.error("❌ Erro de Conexão", {
        description: "Falha ao conectar com a carteira",
      });
    }
  };

  const loadContractData = async (
    contract: ethers.Contract,
    userAccount: string
  ) => {
    try {
      const contractAddress = await contract.getAddress();
      const contractBalance = await contract.cupcakeBalances(contractAddress);
      const userBalance = await contract.cupcakeBalances(userAccount);
      const owner = await contract.owner();

      setContractBalance(Number(contractBalance));
      setUserBalance(Number(userBalance));
      setIsOwner(owner.toLowerCase() === userAccount.toLowerCase());
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("❌ Erro ao carregar dados do contrato", {
        description:
          "Verifique se o contrato está na rede correta e se o endereço no app está atualizado.",
      });
    }
  };

  const purchaseCupcakes = async () => {
    if (!contract || !purchaseAmount) return;
    try {
      setLoading(true);
      const amount = Number.parseInt(purchaseAmount);
      const value = ethers.parseEther((amount * 0.001).toString());
      const tx = await contract.purchase(amount, { value });
      toast.info("🔄 Transação Enviada", {
        description: "Aguardando confirmação...",
      });
      await tx.wait();
      setCupcakeAnimation(true);
      setTimeout(() => setCupcakeAnimation(false), 2000);
      toast.success("🧁 Compra Realizada!", {
        description: `Você comprou ${amount} cupcake${amount > 1 ? "s" : ""}!`,
      });
      await loadContractData(contract, account);
    } catch (error) {
      console.error("Erro na compra:", error);
      toast.error("❌ Erro na Compra", {
        description:
          (error as { reason?: string })?.reason || "Falha ao comprar cupcakes",
      });
    } finally {
      setLoading(false);
    }
  };

  const refillMachine = async () => {
    if (!contract || !refillAmount) return;
    try {
      setLoading(true);
      const amount = Number.parseInt(refillAmount);
      const tx = await contract.refill(amount);
      toast.info("🔄 Reabastecendo...", {
        description: "Aguardando confirmação...",
      });
      await tx.wait();
      toast.success("✅ Máquina Reabastecida!", {
        description: `Adicionados ${amount} cupcakes ao estoque!`,
      });
      await loadContractData(contract, account);
    } catch (error) {
      console.error("Erro no refill:", error);
      toast.error("❌ Erro no Reabastecimento", {
        description:
          (error as { reason?: string })?.reason ?? "Falha ao reabastecer",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMachine = async () => {
    if (!ethers.isAddress(targetContractAddress)) {
      toast.error("❌ Endereço Inválido", {
        description:
          "Por favor, insira um endereço de contrato Ethereum válido.",
      });
      return;
    }

    try {
      setLoading(true);
      toast.info("🔄 Trocando de máquina...", {
        description: `Conectando ao contrato em ${targetContractAddress.slice(
          0,
          6
        )}...${targetContractAddress.slice(-4)}`,
      });

      setContractBalance(0);
      setUserBalance(0);
      setIsOwner(false);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const newContract = new ethers.Contract(
        targetContractAddress,
        CONTRACT_ABI,
        signer
      );

      setContract(newContract);
      setActiveContractAddress(targetContractAddress);

      await loadContractData(newContract, account);

      toast.success("✅ Máquina Carregada!", {
        description: "Você está interagindo com uma nova máquina de cupcakes.",
      });
    } catch (error) {
      console.error("Erro ao trocar de máquina:", error);
      toast.error("❌ Falha ao carregar máquina", {
        description:
          "Verifique se o endereço está correto e se o contrato existe na rede atual.",
      });
      setActiveContractAddress(DEFAULT_CONTRACT_ADDRESS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
            🧁 Cupcake Vending Machine
          </h1>
          <p className="text-xl text-gray-600">
            Máquina de venda de cupcakes descentralizada na blockchain!
          </p>
        </div>

        {/* Conexão da Carteira */}
        {!account ? (
          <Card className="max-w-md mx-auto mb-8 shadow-xl border-2 border-pink-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Wallet className="h-6 w-6" /> Conectar Carteira
              </CardTitle>
              <CardDescription>
                Conecte sua carteira MetaMask para começar a comprar cupcakes!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Wallet className="mr-2 h-4 w-4" /> Conectar MetaMask
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status da Conta */}
            <Card className="shadow-xl border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Sua Conta{" "}
                  {isOwner && <Crown className="h-5 w-5 text-yellow-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Endereço</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Seus Cupcakes
                    </Label>
                    <div className="flex items-center gap-2">
                      <Cake className="h-5 w-5 text-pink-500" />
                      <span className="text-2xl font-bold text-pink-600">
                        {userBalance}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <Crown className="h-3 w-3 mr-1" /> Proprietário
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Máquina de Venda
                </CardTitle>
                <CardDescription>
                  Endereço:{" "}
                  <span className="font-mono text-xs break-all">
                    {activeContractAddress}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Estoque Disponível
                    </Label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-4xl ${
                          cupcakeAnimation ? "animate-bounce" : ""
                        }`}
                      >
                        🧁
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {contractBalance}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Preço por Cupcake
                    </Label>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">0.001 ETH</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="shadow-xl border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => loadContractData(contract!, account)}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados
                  </Button>
                  <div className="text-center">
                    <div className="text-6xl animate-pulse">🧁</div>
                    <p className="text-sm text-gray-600 mt-2">
                      {contractBalance > 0
                        ? "Cupcakes disponíveis!"
                        : "Estoque vazio!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {account && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comprar Cupcakes */}
            <Card className="shadow-xl border-2 border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Comprar Cupcakes
                </CardTitle>
                <CardDescription>Cada cupcake custa 0.001 ETH</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purchase-amount">Quantidade</Label>
                  <Input
                    id="purchase-amount"
                    type="number"
                    min="1"
                    max={contractBalance}
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="text-center text-lg"
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Quantidade:</span>
                    <span>
                      {purchaseAmount} cupcake
                      {Number.parseInt(purchaseAmount) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preço total:</span>
                    <span>
                      {(Number.parseInt(purchaseAmount || "0") * 0.001).toFixed(
                        3
                      )}{" "}
                      ETH
                    </span>
                  </div>
                </div>
                <Button
                  onClick={purchaseCupcakes}
                  disabled={loading || contractBalance === 0 || !purchaseAmount}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Comprando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Comprar Cupcakes
                      🧁
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Painel do Proprietário e Painel de Troca de Máquina */}
            <div className="flex flex-col gap-6">
              {/* Reabastecer (só para owner) */}
              {isOwner && (
                <Card className="shadow-xl border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" /> Reabastecer
                      Máquina
                    </CardTitle>
                    <CardDescription>
                      Apenas o proprietário pode reabastecer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="refill-amount">
                        Quantidade para adicionar
                      </Label>
                      <Input
                        id="refill-amount"
                        type="number"
                        min="1"
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(e.target.value)}
                        className="text-center text-lg"
                      />
                    </div>
                    <Button
                      onClick={refillMachine}
                      disabled={loading || !refillAmount}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Reabastecendo...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" /> Reabastecer com{" "}
                          {refillAmount} cupcakes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" /> Trocar de Máquina
                  </CardTitle>
                  <CardDescription>
                    Insira o endereço de outra Vending Machine para interagir
                    com ela.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contract-address">
                      Endereço do Contrato
                    </Label>
                    <Input
                      id="contract-address"
                      type="text"
                      placeholder="0x..."
                      value={targetContractAddress}
                      onChange={(e) => setTargetContractAddress(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Ou selecione um contrato de exemplo:
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {EXAMPLE_CONTRACTS.map((address) => (
                        <Button
                          key={address}
                          variant="outline"
                          size="sm"
                          className="font-mono text-xs h-auto py-1 px-2"
                          onClick={() => setTargetContractAddress(address)}
                        >
                          {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={switchMachine}
                    disabled={loading || !targetContractAddress}
                    variant="secondary"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Carregando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Carregar Máquina
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white/50 rounded-lg backdrop-blur-sm">
          <p className="text-gray-600 mb-4">Desenvolvido por:</p>
          <div className="flex justify-center items-center gap-8">
            <a
              href="https://github.com/astromar2187"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-gray-700 hover:text-pink-500 transition-colors"
            >
              <img
                src="https://github.com/astromar2187.png"
                alt="Foto de perfil de astromar2187"
                className="h-16 w-16 rounded-full border-2 border-pink-200"
              />
              <span>@astromar2187</span>
            </a>
            <a
              href="https://github.com/Pedroffda"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-gray-700 hover:text-purple-500 transition-colors"
            >
              <img
                src="https://github.com/Pedroffda.png"
                alt="Foto de perfil de Pedroffda"
                className="h-16 w-16 rounded-full border-2 border-purple-200"
              />
              <span>@Pedroffda</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
