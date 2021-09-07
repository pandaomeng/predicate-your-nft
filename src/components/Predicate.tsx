import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import './Predicate.css'

interface NFTMetadata {
  tokenId: string
  image: string
  name: string
  description: string
}

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545')

const FACTORY_ABI: AbiItem[] = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const PAGE_SIZE = 50

const Predicate: React.FC = () => {
  const [page, setPage] = useState(0)
  // const images =
  const [nfts, setNfts] = useState<NFTMetadata[]>([])

  const query = async () => {
    const contract = new web3.eth.Contract(FACTORY_ABI, '0xa39fb2c494b457593f9cbbef4a02f799330ddfd8')

    const batch = new web3.BatchRequest()

    // 使用一个数组存结果
    const result: NFTMetadata[] = []
    for (let i = 0; i < PAGE_SIZE; i += 1) {
      const tokenId = page * PAGE_SIZE + i + 1
      batch.add(
        contract.methods.tokenURI(tokenId).call.request(null, (error: Error, res: string) => {
          const dataPart = res.slice('data:application/json;base64,'.length)

          try {
            const json = JSON.parse(atob(dataPart))
            result[i] = {
              tokenId: `${tokenId}`,
              name: json.name,
              image: json.image,
              description: json.description,
            }
            console.log(result)
            setNfts([...result])
          } catch (e) {
            console.error(e)
          }
        }),
      )
    }

    try {
      batch.execute()
    } catch (e) {
      console.log('e: ', e)
    }
  }

  useEffect(() => {
    query()
  }, [])

  console.log('nfts: ', nfts)

  return (
    <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
      {nfts.map(each => (
        <div style={{ width: 300, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div>
            <img
              key={each.tokenId}
              alt="nft img"
              style={{
                display: 'block',
                width: 300,
                height: 300,
              }}
              id={each.tokenId}
              src={each.image}
            />
          </div>
          <div style={{ fontSize: '20px', padding: '5px 0 5px' }}>{each.name}</div>
          <div className="description">description: {each.description}</div>
        </div>
      ))}
    </div>
  )
}

export default Predicate
