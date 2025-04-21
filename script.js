console.log("Site Brazuka carregado com sucesso!");
let carteiraConectada = null;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();
      if (network.chainId !== 97) {
        await switchToBSC_Testnet();
      }

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      carteiraConectada = address;

      const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
      document.getElementById("wallet-address").innerText = `Conectado: ${shortened}`;

      const connectBtn = document.getElementById("connect-btn");
      if (connectBtn) connectBtn.style.display = "none";

      const pixBtn = document.getElementById("pix-button");
      if (pixBtn) pixBtn.style.display = "inline-block";

      mostrarSaldoBRAZ(provider, address);
    } catch (err) {
      alert("Erro ao conectar ou trocar rede.");
      console.error(err);
    }
  } else {
    alert("MetaMask não detectado.");
  }
}

const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function mostrarSaldoBRAZ(provider, address) {
  const tokenAddress = "0x935814FF77528d57AE6Fc94bC70f09eAcC89ceDE"; // BSC Testnet
  const contract = new ethers.Contract(tokenAddress, tokenABI, provider);

  try {
    const rawBalance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const balance = ethers.utils.formatUnits(rawBalance, decimals);
    document.getElementById("wallet-balance").innerText = `Saldo BRAZ: ${balance}`;
  } catch (err) {
    console.error("Erro ao buscar saldo:", err);
    document.getElementById("wallet-balance").innerText = "Erro ao obter saldo";
  }
}

async function switchToBSC_Testnet() {
  const bscTestnet = {
    chainId: '0x61',
    chainName: 'Binance Smart Chain Testnet',
    nativeCurrency: { name: 'BNB Test', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com']
  };

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [bscTestnet]
    });
  } catch (error) {
    console.error("Erro ao trocar para BSC Testnet:", error);
  }
}
