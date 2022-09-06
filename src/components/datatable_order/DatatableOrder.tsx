import './datatable_order.scss'
import { DataGrid } from '@mui/x-data-grid'
import { orderColumns } from '../../datatablesource'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { Backdrop, CircularProgress } from '@mui/material'

import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import React, { FunctionComponent } from 'react'
import { FormControl, InputAdornment, TextField } from '@mui/material'
import { makeStyles, createStyles } from '@mui/styles'

const DatatableOrder = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    console.log({ query })
    console.log({ data })

    useEffect(() => {
        // const fetchData = async () => {
        //     let list = [];
        //     try {
        //         const querySnapshot = await getDocs(collection(db, 'users'));
        //         querySnapshot.forEach((doc) => {
        //             list.push({ id: doc.id, ...doc.data() });
        //         });
        //         setData(list);
        //         console.log(list);
        //     } catch (err) {
        //         console.log(err);
        //     }
        // };
        // fetchData();

        // LISTEN (REALTIME)
        setLoading(true)
        const unsub = onSnapshot(
            collection(db, 'order'),
            (snapShot) => {
                const list: any = []
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() })
                })
                setData(list)
                setLoading(false)
            },
            (error) => {
                console.log(error)
            }
        )

        return () => {
            unsub()
        }
    }, [])
    const keys = ['name', 'phone', 'cartItems', 'totalQuantity']
    // chu y voi cac key tao ben client se k co gay ra loi

    const search = (data: any) => {
        if (data && data.length) {
            return data.filter((item: any) => keys.some((key) => item[key].toLowerCase().includes(query.toLowerCase())))
        } else return []
    }
    console.log('data', search(data))

    const handleDelete = async (id: any) => {
        try {
            await deleteDoc(doc(db, 'order', id))
            setData(data.filter((item: any) => item.id !== id))
        } catch (err) {
            console.log(err)
        }
    }

    const handleEdit = (id: any) => {
        navigate('/users/edit', { state: id })
    }

    const [showClearIcon, setShowClearIcon] = useState('none')

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setShowClearIcon(event.target.value === '' ? 'none' : 'flex')
        setQuery(event.target.value)
    }

    const handleClick = (): void => {
        // TODO: Clear the search input
        console.log('clicked the clear icon...')
        setQuery('')
    }

    const actionColumn = [
        {
            field: 'action',
            headerName: 'Action',
            width: 200,
            renderCell: (params: any) => {
                return (
                    <div className="cellAction">
                        <Link to={`/users/${params.row.id}`} style={{ textDecoration: 'none' }}>
                            <div className="viewButton">View</div>
                        </Link>

                        <div className="viewButton" onClick={() => handleEdit(params.row.id)}>
                            Edit
                        </div>

                        <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>
                            Delete
                        </div>
                    </div>
                )
            },
        },
    ]

    interface CartItemsState {
        id: string
        title: string
        price: number
        quantity: number
        totalPrice: number
        img: [{ img: string }]
        totalAmountOrder: number
        totalStock: number
    }
    function setDate(unixTime: number) {
        const date = new Date(unixTime * 1000)
        // console.log(date.toLocaleDateString('en-US'))
        return date.toLocaleDateString('en-US')
    }

    return (
        <>
            {/* {loading ? (
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={true}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            ) : ( */}
            <div className="datatable">
                <div className="datatableTitle">
                    Order
                    <div className="search">
                        <FormControl>
                            <TextField
                                size="small"
                                variant="outlined"
                                onChange={handleChange}
                                value={query}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end" style={{ display: showClearIcon }} onClick={handleClick}>
                                            <ClearIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>
                    </div>
                    <Link to="/users/new" className="link">
                        Add New
                    </Link>
                </div>
                {/* <DataGrid className="datagrid" rows={search(data)} columns={orderColumns.concat(actionColumn)} pageSize={5} rowsPerPageOptions={[5]} checkboxSelection /> */}
                <div className="table-responsive">
                    <table className="table table-bordered border-primary">
                        <thead>
                            <tr>
                                <th scope="col">STT</th>
                                <th scope="col">Ngày mua</th>
                                <th scope="col">Sản phẩm</th>
                                <th scope="col">Số lượng</th>
                                <th scope="col">Đơn giá</th>
                                <th scope="col">Phí vận chuyển</th>
                                <th scope="col">Tổng tiền</th>
                                <th scope="col">Trạng thái đơn hàng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data &&
                                data.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{setDate(item.timeStamp.seconds)}</td>
                                        <td className="">
                                            {item.cartItems.map((item: CartItemsState, index: number) => (
                                                <div key={index} className="d-flex flex-colum ">
                                                    <img src={item.img[0].img} className="order__item-img" />
                                                    <p>{item.title}</p>
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            {item.cartItems.map((item: CartItemsState, index: number) => (
                                                <div key={index} className="d-flex flex-colum justify-content-between">
                                                    <p>{item.quantity}</p>
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            {item.cartItems.map((item: CartItemsState, index: number) => (
                                                <div key={index} className="d-flex flex-colum justify-content-between">
                                                    <p>{item.price}</p>
                                                </div>
                                            ))}
                                        </td>
                                        <td>30</td>
                                        <td>{item.totalAmountOrder}</td>
                                        <td>Đặt hàng thành công</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* )} */}
        </>
    )
}

export default DatatableOrder
