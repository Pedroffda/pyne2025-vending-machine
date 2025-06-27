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
  Star,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

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
      toast.error(t("toasts.data_load_error"), {
        description: t("toasts.data_load_error_desc"),
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
      toast.info(t("toasts.transaction_sent"), {
        description: t("toasts.transaction_sent_desc"),
      });
      await tx.wait();
      setCupcakeAnimation(true);
      setTimeout(() => setCupcakeAnimation(false), 2000);
      toast.success(t("toasts.purchase_successful"), {
        description: t("toasts.purchase_successful_desc", { amount }),
      });
      await loadContractData(contract, account);
    } catch (error) {
      console.error("Erro na compra:", error);
      toast.error(t("toasts.purchase_error"), {
        description:
          (error as { reason?: string })?.reason ||
          t("toasts.purchase_error_desc"),
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
      toast.info(t("toasts.refill_sent"), {
        description: t("toasts.refill_sent_desc"),
      });
      await tx.wait();
      toast.success(t("toasts.refill_successful"), {
        description: t("toasts.refill_successful_desc", { amount }),
      });
      await loadContractData(contract, account);
    } catch (error) {
      console.error("Erro no refill:", error);
      toast.error(t("toasts.refill_error"), {
        description:
          (error as { reason?: string })?.reason ??
          t("toasts.refill_error_desc"),
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMachine = async () => {
    if (!ethers.isAddress(targetContractAddress)) {
      toast.error(t("toasts.invalid_address"), {
        description: t("toasts.invalid_address_desc"),
      });
      return;
    }

    try {
      setLoading(true);
      toast.info(t("toasts.switching_machine"), {
        description: t("toasts.switching_machine_desc", {
          address: `${targetContractAddress.slice(
            0,
            6
          )}...${targetContractAddress.slice(-4)}`,
        }),
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

      toast.success(t("toasts.machine_loaded"), {
        description: t("toasts.machine_loaded_desc"),
      });
    } catch (error) {
      console.error("Erro ao trocar de máquina:", error);
      toast.error(t("toasts.machine_load_failed"), {
        description: t("toasts.machine_load_failed_desc"),
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
          <div className="flex justify-center items-center gap-4 mb-4">
            <Button
              variant={i18n.language === "en" ? "default" : "outline"}
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </Button>
            <Button
              variant={i18n.language === "pt" ? "default" : "outline"}
              onClick={() => i18n.changeLanguage("pt")}
            >
              PT-BR
            </Button>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
            {t("header.title")}
          </h1>
          <p className="text-xl text-gray-600">{t("header.subtitle")}</p>
        </div>

        {/* Conexão da Carteira */}
        {!account ? (
          <Card className="max-w-md mx-auto mb-8 shadow-xl border-2 border-pink-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Wallet className="h-6 w-6" /> {t("wallet.connect_wallet")}
              </CardTitle>
              <CardDescription>
                {t("wallet.connect_wallet_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Wallet className="mr-2 h-4 w-4" />{" "}
                {t("wallet.connect_metamask")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status da Conta */}
            <Card className="shadow-xl border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> {t("account.your_account")}{" "}
                  {isOwner && <Crown className="h-5 w-5 text-yellow-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">
                      {t("account.address")}
                    </Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      {t("account.your_cupcakes")}
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
                      <Crown className="h-3 w-3 mr-1" /> {t("account.owner")}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> {t("machine.title")}
                </CardTitle>
                <CardDescription>
                  {t("machine.address")}:{" "}
                  <span className="font-mono text-xs break-all">
                    {activeContractAddress}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">
                      {t("machine.available_stock")}
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
                      {t("machine.price_per_cupcake")}
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
                <CardTitle>{t("actions.quick_actions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => loadContractData(contract!, account)}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />{" "}
                    {t("actions.refresh_data")}
                  </Button>
                  <div className="text-center">
                    <div className="text-6xl animate-pulse">🧁</div>
                    <p className="text-sm text-gray-600 mt-2">
                      {contractBalance > 0
                        ? t("actions.cupcakes_available")
                        : t("actions.stock_empty")}
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
                  <ShoppingCart className="h-5 w-5" />{" "}
                  {t("purchase.buy_cupcakes")}
                </CardTitle>
                <CardDescription>
                  {t("purchase.buy_cupcakes_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purchase-amount">
                    {t("purchase.quantity")}
                  </Label>
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
                    <span>{t("purchase.quantity")}:</span>
                    <span>
                      {purchaseAmount} cupcake
                      {Number.parseInt(purchaseAmount) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("purchase.total_price")}:</span>
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
                      {t("purchase.buying")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />{" "}
                      {t("purchase.buy_cupcakes_button")}
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
                      <Crown className="h-5 w-5 text-yellow-500" />{" "}
                      {t("owner_panel.refill_machine")}
                    </CardTitle>
                    <CardDescription>
                      {t("owner_panel.refill_machine_desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="refill-amount">
                        {t("owner_panel.quantity_to_add")}
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
                          {t("owner_panel.refilling")}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />{" "}
                          {t("owner_panel.refill_with_amount", {
                            amount: refillAmount,
                          })}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />{" "}
                    {t("switch_machine.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("switch_machine.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contract-address">
                      {t("switch_machine.contract_address")}
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
                      {t("switch_machine.example_contracts")}
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
                        {t("switch_machine.loading")}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />{" "}
                        {t("switch_machine.load_machine")}
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
          <p className="text-gray-600 mb-4">{t("footer.developed_by")}</p>
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
          <div className="mt-8 border-t pt-6">
            <a
              href="https://github.com/Pedroffda/pyne2025-vending-machine"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-purple-500 transition-colors"
            >
              <Star className="h-5 w-5 text-yellow-400" />
              <span>{t("footer.leave_star")}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
