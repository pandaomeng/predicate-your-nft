import React, { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import _ from 'lodash'
import { Pagination, Input, message } from 'antd'
import './Predict.css'
import { Contract } from 'web3-eth-contract'
import qs from 'query-string'
import WowLootABI from './WowLootABI'

const { Search } = Input

interface NFTMetadata {
  tokenId: string
  image: string
  name: string
  description: string
}

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545')
// const contract = new web3.eth.Contract(WowLootABI, '0xa39fb2c494b457593f9cbbef4a02f799330ddfd8')

const PAGE_SIZE = 100

const Predict: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(10000)
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState<Contract | null>(null)
  const [searchValue, setSearchValue] = useState('')

  // const images =
  const [nfts, setNfts] = useState<NFTMetadata[]>([])

  const setNftThrottle = useMemo(() => _.throttle(setNfts, 50), [setNfts])

  const query = async (page: number) => {
    // setLoading(true)
    setCurrentPage(page)

    if (!contract) return

    const batch = new web3.BatchRequest()

    // 使用一个数组存结果
    const result: NFTMetadata[] = []
    for (let i = 0; i < PAGE_SIZE; i += 1) {
      const tokenId = (page - 1) * PAGE_SIZE + i + 1
      batch.add(
        contract.methods.tokenURI(tokenId).call.request(null, (error: Error, res: string) => {
          try {
            let json: any = {}
            if (res.indexOf('data:application/json;base64,') === 0) {
              const dataPart = res.slice('data:application/json;base64,'.length)
              json = JSON.parse(atob(dataPart))
            } else {
              // TODO: 用 axios 去读取
            }
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
    const { search } = window.location
    const { address } = qs.parse(search)
    if (address && typeof address === 'string') {
      const newContract = new web3.eth.Contract(WowLootABI, address)
      setSearchValue(address)
      setContract(newContract)
    }
  }, [])

  useEffect(() => {
    query(1)
  }, [contract])

  const onPageChange = (newPage: number) => {
    if (!contract) {
      message.error('请先设置合约地址')
      return
    }
    setNfts([])
    setLoading(true)
    query(newPage)
  }

  const onSearch = (value: string) => {
    let address: string | undefined = value
    if (value.indexOf('http') !== -1) {
      address = value.split('/').pop()
      if (!address) {
        message.error('地址错误')
        return
      }
    }
    const newContract = new web3.eth.Contract(WowLootABI, address)
    setContract(newContract)
  }

  const handleSearchChange = (e: any) => {
    setSearchValue(e.value)
  }

  return (
    <div style={{ margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <Search
          placeholder="请输入NFT合约地址"
          onSearch={onSearch}
          enterButton
          value={searchValue}
          onChange={handleSearchChange}
          style={{
            width: 500,
            margin: 'auto',
          }}
        />
      </div>

      <Pagination
        current={currentPage}
        defaultCurrent={1}
        total={total}
        pageSize={PAGE_SIZE}
        style={{ textAlign: 'center' }}
        showSizeChanger={false}
        onChange={onPageChange}
        showQuickJumper
      />

      <div className="card-container">
        {/* TODO: 占位符，不要坍缩 */}
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

export default Predict
