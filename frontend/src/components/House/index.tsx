import {Button, Image, message } from 'antd';

import {web3, houseContract, myERC721Contract} from "../../utils/contracts";
import {ReactNode, useEffect, useState} from 'react';
const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const HousePage = () => {
    const properties = [
        {image: 'https://cdn.pixabay.com/photo/2014/08/11/21/27/houses-416031_640.jpg', },
        {image: 'https://cdn.pixabay.com/photo/2014/07/05/08/33/row-houses-384596_640.jpg', },
        {image: 'https://cdn.pixabay.com/photo/2014/11/21/17/17/house-540796_640.jpg', },
        {image: 'https://cdn.pixabay.com/photo/2019/07/02/21/03/water-mill-4313165_640.jpg', },
        {image: 'https://cdn.pixabay.com/photo/2017/03/27/15/17/apartment-2179337_640.jpg', },
    ];
    const [account, setAccount] = useState('')
    const [managerAccount, setManagerAccount] = useState('')
    const [myHouses, setMyHouses] = useState([]);
    const [listHouses, setListHouses] = useState([]);

    // set manager-account
    useEffect(() => {
        const getContractInfo = async () => {
            if (houseContract) {
                const ma = await houseContract.methods.platformOwner().call()
                setManagerAccount(ma)
            } else {
                alert('Contract not exists.')
            }
        }

        getContractInfo()
    }, [])

    // initially check wallet-link
    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    // get the house list of this user
    useEffect(() => {
        const fetchMyHouses = async () => {
            if (houseContract && account) {
                const houses = await houseContract.methods.getMyHouses().call({ from: account });
                setMyHouses(houses);
            }
        };

        if(account !== '') {
            fetchMyHouses()
        }
    }, [account])

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    const onClickClaimAirDrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if(myERC721Contract) {
            try {
                await myERC721Contract.methods.airdrop().send({
                    from:account
                })
                alert('Claimed House Token successfully.');
            } catch (error: any) {
                alert("Claim failed.")
            }
        } else {
            alert("Contracts not exists.")
        }
    }

    const onClickHouseInfo =  async (token:any) => {
        try {
            if (houseContract && account) {
                const info = await houseContract.methods.getHouseInfo(token).call({ from: account });
                if(info.isListed==false) {
                    alert(`房产信息\n  - 是否挂单: 未挂单`);
                } else {
                    const houseInfo = {
                        owner:info.owner,
                        isListed: info.isListed ? '已挂单' : '未挂单',
                        price: info.price,
                        listTimestamp: info.listTimestamp ? new Date(info.listTimestamp * 1000).toLocaleString() : '无',
                    };
                    alert(`房产信息\n - 拥有者: ${houseInfo.owner}\n - 是否挂单: ${houseInfo.isListed}\n - 挂单时间: ${houseInfo.listTimestamp}\n - 价格: ${houseInfo.price}ETH`);
                }
            } else {
                alert('请先连接钱包');
            }
        } catch (error: any) {
            alert(error.message);
        }
    }

    const onClickListHouse =  async (token:any) => {
        try {
            if (houseContract && account) {
                const price = prompt('请输入出售价格（单位ETH）：');
                await houseContract.methods.listHouse(token, price).send({ from: account });
                alert("List successfully.");
            } else {
                alert('请先连接钱包');
            }
        } catch (error: any) {
            alert("List failed.");
        }
    }

    return (
        <div className='container'>
            <h1>去中心化房屋购买系统</h1>
            <Button onClick={onClickConnectWallet}>连接钱包</Button>
            <Button onClick={onClickClaimAirDrop}>申请空投</Button>
            <div>管理员：{managerAccount}</div>

            <div className='account'>
                {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                <div>当前用户：{account === '' ? '无用户连接' : account}</div>
            </div>

            <div className='operation'>
                <div style={{marginBottom: '20px'}}>操作栏</div>
                <div className='buttons'>
                </div>
            </div>

            <div className='myHouseList'>
                <h2>我的房产</h2>
                {myHouses.length > 0 ? (
                    myHouses.map((house, token) => (
                        <div key={token}>
                            <Image src={properties[house % properties.length].image} alt="房产图片"/>
                            <div>房产ID: {house}</div>
                            <Button onClick={() => onClickHouseInfo(house)}>查看信息</Button>
                            <Button onClick={() => onClickListHouse(house)}>挂单出售</Button>
                        </div>
                    ))
                ) : (
                    <p>暂无房产</p>
                )}
            </div>

            <div className='buyHouseList'>
                <h2>房产交易</h2>
                {myHouses.length > 0 ? (
                    myHouses.map((house, token) => (
                        <div key={token}>
                            <Image src={properties[house % properties.length].image} alt="房产图片"/>
                            <div>房产ID: {house}</div>
                            <Button onClick={() => onClickHouseInfo(house)}>查看信息</Button>
                            <Button onClick={() => onClickListHouse(house)}>挂单出售</Button>
                        </div>
                    ))
                ) : (
                    <p>暂无房产</p>
                )}
            </div>
        </div>
    )
}

export default HousePage