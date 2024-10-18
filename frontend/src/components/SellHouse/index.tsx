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



    return (
        <div className='container'>

        </div>
    )
}

export default HousePage