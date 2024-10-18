import {Button, Image, message} from 'antd';

import {web3, houseContract, myERC721Contract} from "../../utils/contracts";
import {ReactNode, useEffect, useState} from 'react';
const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const HousePage = () => {
    const [account, setAccount] = useState('')
    const [managerAccount, setManagerAccount] = useState('')
    const [myHouses, setMyHouses] = useState([]);
    const [housesForSale, setHousesForSale] = useState([]);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [listPrice, setListPrice] = useState(0);

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

    // 查看用户房产余额（可选）
    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC721Contract) {

            } else {
                alert('合约不存在。');
            }
        };

        if (account !== '') {
            getAccountInfo();
        }
    }, [account]);

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

    const onClickListHouse =  async () => {
        try {


        } catch (error: any) {
            alert(error.message)
        }
    }

    // 挂单出售房屋
    // const handleListHouse = async (tokenId) => {
    //     try {
    //         await houseContract.methods.listHouse(tokenId, web3.utils.toWei(listPrice.toString(), 'ether')).send({ from: account });
    //         message.success('房屋成功挂单出售！');
    //         setListPrice(0); // Reset the input
    //     } catch (error) {
    //         message.error(`挂单失败: ${error.message}`);
    //     }
    // };

    // 购买房屋
    // const handleBuyHouse = async (tokenId, price) => {
    //     try {
    //         await houseContract.methods.buyHouse(tokenId).send({ from: account, value: price });
    //         message.success('房屋购买成功！');
    //     } catch (error) {
    //         message.error(`购买失败: ${error.message}`);
    //     }
    // };

    // 获取房产详细信息
    // const getHouseDetails = async (tokenId) => {
    //     const houseInfo = await houseContract.methods.getHouseInfo(tokenId).call();
    //     setSelectedHouse(houseInfo);
    // };


    return (
        <div className='container'>
            <h1>去中心化房屋购买系统</h1>
            <Button onClick={onClickConnectWallet}>连接钱包</Button>
            <div>管理员地址：{managerAccount}</div>
            <div className='account'>
                {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                <div>当前用户：{account === '' ? '无用户连接' : account}</div>
            </div>

            <div className='operation'>
                <div style={{marginBottom: '20px'}}>操作栏</div>
                <div className='buttons'>
                    <Button onClick={onClickListHouse} style={{width: '200px'}} >查看我的房产</Button>
                </div>
            </div>
        </div>
    )
}

export default HousePage