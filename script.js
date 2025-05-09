
console.log("Site Brazuka carregado com sucesso!");
let carteiraConectada = null;

// Conexão da carteira
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      carteiraConectada = address;
      localStorage.setItem("wallet", address);

      atualizarInterface(provider, address);
    } catch (err) {
      alert("Erro ao conectar a carteira.");
      console.error(err);
    }
  } else {
    alert("MetaMask ou carteira compatível não detectada.");
  }
}

// Atualiza interface visual com a carteira conectada
function atualizarInterface(provider, address) {
  const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
  document.getElementById("wallet-address").innerText = `Conectado: ${shortened}`;
  document.getElementById("connect-btn").style.display = "none";

  const pixBtn = document.getElementById("pix-button");
  if (pixBtn) pixBtn.style.display = "inline-block";

  mostrarSaldoBRAZ(provider, address);
}

// ABI e função para mostrar saldo BRAZ
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

// Geração do Pix com verificação automática
function gerarPix() {
  const valor = prompt("Digite o valor em R$ para gerar o QR Pix:");

  if (!carteiraConectada) {
    alert("Você precisa conectar sua carteira antes.");
    return;
  }

  const carteira = carteiraConectada;

  fetch("https://brazuka-api.vercel.app/pix/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      valorBRL: valor,
      carteira: carteira,
      fase: "1"
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.qrCode && data.payload && data.txid) {
        document.getElementById("qr-code").src = data.qrCode;
        document.getElementById("pix-code").innerText = data.payload;
        document.getElementById("pix-container").style.display = "block";
        document.getElementById("pix-status").innerText = "Aguardando confirmação automática...";
        verificarStatusPix(data.txid);
      } else {
        alert("Erro ao gerar QR Pix. Tente novamente.");
      }
    });
}

// Verificação periódica do status do Pix
function verificarStatusPix(txid) {
  const interval = setInterval(() => {
    fetch(`https://brazuka-api.vercel.app/pix/status?txid=${txid}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "confirmado") {
          clearInterval(interval);
          document.getElementById("pix-status").innerText = "✅ Pagamento confirmado! Tokens BRAZ em breve na sua carteira.";
        }
      })
      .catch(err => {
        console.warn("Erro ao verificar status do Pix:", err);
      });
  }, 5000);
}

// Reconexão automática ao carregar a página
window.addEventListener("load", async () => {
  const address = localStorage.getItem("wallet");
  if (address && typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    carteiraConectada = address;
    atualizarInterface(provider, address);
  }

  const connectBtn = document.getElementById("connect-btn");
  if (connectBtn) connectBtn.addEventListener("click", connectWallet);
});
