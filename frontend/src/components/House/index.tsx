import {Button, Image } from 'antd';
import {web3, houseContract, tokenContract} from "../../utils/contracts";
import {useEffect, useState} from 'react';
const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const HousePage = () => {
    const properties = [
        {image: 'https://cdn.pixabay.com/photo/2014/08/11/21/27/houses-416031_640.jpg'},
        {image: 'https://cdn.pixabay.com/photo/2014/07/05/08/33/row-houses-384596_640.jpg'},
        {image: 'https://cdn.pixabay.com/photo/2014/08/03/23/41/house-409451_640.jpg'},
        {image: 'https://cdn.pixabay.com/photo/2019/07/02/21/03/water-mill-4313165_640.jpg'},
        {image: 'https://cdn.pixabay.com/photo/2016/11/29/03/53/house-1867187_640.jpg'},
        {image: 'https://cdn.pixabay.com/photo/2016/05/17/22/33/house-1399401_960_720.jpg'},
    ];
    const [account, setAccount] = useState('')
    const [managerAccount, setManagerAccount] = useState('')
    const [myHouses, setMyHouses] = useState([]);
    const [listHouses, setListHouses] = useState([]);
    const [tokenBalance, setTokenBalance] = useState(0);

    // get manager-account
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

    // get the listed-house list
    useEffect(() => {
        const fetchListedHouses = async () => {
            if (houseContract ) {
                const houses = await houseContract.methods.getListedHouses().call();
                setListHouses(houses);
            }
        };

        fetchListedHouses()
    }, [])

    // get token balance of this user
    useEffect(() => {
        const getTokenBalance = async () => {
            if (tokenContract && account) {
                const balance = await tokenContract.methods.balanceOf(account).call();
                setTokenBalance(balance);
            }
        };

        if(account !== '') {
            getTokenBalance();
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
        if(houseContract) {
            try {
                await houseContract.methods.airdrop().send({ from: account })
                alert('Claimed House Token successfully.');
            } catch (error: any) {
                alert("Claim failed.")
            }
        } else {
            alert("Contracts not exists.")
        }
    }

    const onCLickExchangeToken= async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if(tokenContract) {
            const amount = prompt('请输入兑换金额/ETH (1ETH=100RTK)');
            const amountInWei = web3.utils.toWei(amount, 'ether');
            await tokenContract.methods.exchangeETHForTokens().send({from: account, value: amountInWei});
            alert("Tokens exchanged successfully");
        } else {
            alert("Contracts not exists.");
        }
    }

    const onCLickWithdrawToken= async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if(tokenContract) {
            const tokenAmount = prompt('请输入提取金额/RTK (100RTK = 1ETH)');
            await tokenContract.methods.withdrawTokenForETH(tokenAmount).send({from: account});
            alert("Tokens withdraw successfully");
        } else {
            alert("Contracts not exists.");
        }
    }

    const onClickHouseInfo =  async (token:any) => {
        try {
            if (houseContract && account) {
                const info = await houseContract.methods.getHouseInfo(token).call();
                // show price in ETH rather than Wei
                // const priceInEth = web3.utils.fromWei(info.price.toString(), 'ether');
                const houseInfo = {
                    owner:info.owner,
                    isListed: info.isListed ? '已挂单' : '未挂单',
                    price: info.isListed ? info.price+" RTK": '无',
                    listTimestamp: info.isListed ? new Date(info.listTimestamp * 1000).toLocaleString() : '无',
                };
                alert(`房产信息\n - 拥有者: ${houseInfo.owner}\n - 是否挂单: ${houseInfo.isListed}\n - 挂单时间: ${houseInfo.listTimestamp}\n - 价格: ${houseInfo.price}`);
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
                const price = prompt('请输入出售积分(RTK)：');
                await houseContract.methods.listHouse(token, price).send({ from: account });
                alert("List successfully.");
            } else {
                alert('请先连接钱包');
            }
        } catch (error: any) {
            const errorMessage = error.message || "Something wrong.";
            alert(`Buy failed: ${errorMessage}`);
        }
    }

    const onClickBuyHouse = async (token: any) => {
        try {
            if (houseContract && account) {
                const houseInfo = await houseContract.methods.getHouseInfo(token).call();
                const timestamp = Math.floor(Date.now() / 1000);
                // alert(timestamp)
                // const platformFee = (timestamp - houseInfo.listTimestamp)/60 * 1 * houseInfo.price /100 ;
                // const sellerFee = houseInfo.price - platformFee;
                // alert(`Platform Fee: ${platformFee}`);
                // alert(`Seller Fee: ${sellerFee}`);
                // approve the RTK to the house Contract
                await tokenContract.methods.approve(houseContract.options.address, houseInfo.price).send({ from: account });
                await houseContract.methods.buyHouse(token).send({ from: account });
                alert("Buy successfully.");
            } else {
                alert('请先连接钱包');
            }
        } catch (error: any) {
            const errorMessage = error.message || "Something wrong.";
            alert(`Buy failed: ${errorMessage}`);
        }
    }

    return (
        <div className='container'>
            <h1>去中心化房屋购买系统</h1>
            <Button onClick={onClickConnectWallet}>连接钱包</Button>
            <Button onClick={onClickClaimAirDrop}>申请空投</Button>
            <Button onClick={onCLickExchangeToken}>兑换积分</Button>
            <Button onClick={onCLickWithdrawToken}>提取积分</Button>

            <div>管理员：{managerAccount}</div>

            <div className='account'>
                {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                <div>当前积分：{account === '' ? '无用户连接' : tokenBalance.toString()+ " RTK" }</div>
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
                {listHouses.length > 0 ? (
                    listHouses.map((house, token) => (
                        <div key={token}>
                            <Image src={properties[house % properties.length].image} alt="房产图片"/>
                            <div>房产ID: {house}</div>
                            <Button onClick={() => onClickHouseInfo(house)}>查看信息</Button>
                            <Button onClick={() => onClickBuyHouse(house)}>购买此房</Button>
                        </div>
                    ))
                ) : (
                    <p>暂无房产待出售</p>
                )}
            </div>
        </div>
    )
}

export default HousePage