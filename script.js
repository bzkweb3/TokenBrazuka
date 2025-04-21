console.log("Site Brazuka carregado!");
let carteiraConectada = null;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask ou carteira compatível não detectada.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    carteiraConectada = address;

    // Atualiza UI
    const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
    document.getElementById("wallet-address").innerText = `Conectado: ${shortened}`;
    document.getElementById("connect-btn").style.display = "none";

    const pixBtn = document.getElementById("pix-button");
    if (pixBtn) pixBtn.style.display = "inline-block";

    mostrarSaldoBRAZ(provider, address);
  } catch (err) {
    console.error("Erro ao conectar:", err);
    alert("Erro ao conectar à carteira.");
  }
}

async function mostrarSaldoBRAZ(provider, address) {
  const tokenAddress = "0x935814FF77528d57AE6Fc94bC70f09eAcC89ceDE"; // BSC Testnet
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const contract = new ethers.Contract(tokenAddress, abi, provider);
  try {
    const balanceRaw = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const balance = ethers.utils.formatUnits(balanceRaw, decimals);
    document.getElementById("wallet-balance").innerText = `Saldo BRAZ: ${balance}`;
  } catch (err) {
    console.error("Erro ao buscar saldo:", err);
    document.getElementById("wallet-balance").innerText = "Erro no saldo";
  }
}
