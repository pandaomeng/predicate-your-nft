import React, { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import _ from 'lodash'
import { Pagination } from 'antd'
import './Predicate.css'
import WowLootABI from './WowLootABI'

interface NFTMetadata {
  tokenId: string
  image: string
  name: string
  description: string
}

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545')
const contract = new web3.eth.Contract(WowLootABI, '0xa39fb2c494b457593f9cbbef4a02f799330ddfd8')

const PAGE_SIZE = 100

const Predicate: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(10000)
  const [loading, setLoading] = useState(false)
  // const images =
  const [nfts, setNfts] = useState<NFTMetadata[]>([])

  const setNftThrottle = useMemo(() => _.throttle(setNfts, 50), [setNfts])

  const query = async (page: number) => {
    // setLoading(true)
    setCurrentPage(page)
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
            setNftThrottle([...result])
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

  // const queryTotalSupply = async () => {
  //   const totalSupply = await contract.methods.totalSupply().call()
  //   console.log(totalSupply)
  //   setTotal(totalSupply)
  // }

  useEffect(() => {
    // queryTotalSupply()
    query(0)
  }, [])

  const onPageChange = (newPage: number) => {
    setNfts([])
    setLoading(true)
    query(newPage)
  }

  return (
    <div style={{ margin: 'auto' }}>
      <Pagination
        defaultCurrent={1}
        total={total}
        pageSize={PAGE_SIZE}
        style={{ textAlign: 'center' }}
        showSizeChanger={false}
        onChange={onPageChange}
        showQuickJumper
      />

      <div className="card-container">
        {nfts.map(each => (
          <div key={each.tokenId} style={{ width: 340, padding: 20, display: 'flex', flexDirection: 'column' }}>
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
            <div className="description">{each.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Predicate
