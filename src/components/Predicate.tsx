import React, { useEffect } from 'react';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

const FACTORY_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export default function Predicate() {
  useEffect(() => {
    const contract = new web3.eth.Contract(
      FACTORY_ABI,
      '0xa39fb2c494b457593f9cbbef4a02f799330ddfd8'
    );

    contract.methods.tokenURI('');

    return () => {};
  }, []);

  return <div>this is predicate page</div>;
}
