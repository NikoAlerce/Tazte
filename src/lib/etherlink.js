import { http, createConfig } from 'wagmi';
import { mainnet, base } from 'wagmi/chains';

// Define Etherlink Mainnet
export const etherlink = {
  id: 42793,
  name: 'Etherlink',
  network: 'etherlink',
  nativeCurrency: {
    decimals: 18,
    name: 'Tezos',
    symbol: 'XTZ',
  },
  rpcUrls: {
    default: { http: ['https://node.mainnet.etherlink.com'] },
    public: { http: ['https://node.mainnet.etherlink.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherlink Explorer', url: 'https://explorer.etherlink.com' },
  },
};

export const config = createConfig({
  chains: [etherlink, mainnet],
  transports: {
    [etherlink.id]: http(),
    [mainnet.id]: http(),
  },
});
