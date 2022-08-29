import './category.scss'
import Navbar from '../../components/navbar/Navbar'
import Sidebar from '../../components/sidebar/Sidebar'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import _ from 'lodash'
import {
    collection,
    // getDocs,
    onSnapshot,
    deleteDoc,
    doc,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useNavigate } from 'react-router-dom'

function Category() {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [filter, setFilter] = useState(data)
    const [loading, setLoading] = useState(true)
    console.log({ filter })

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'products'),
            (snapShot) => {
                let list = []
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() })
                })
                const cloneList = _.clone(list)
                setFilter(cloneList)
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
    console.log({ filter })

    const filterProduct = (category) => {
        const updateProduct = data.filter((item) => item.category === category)
        setFilter(updateProduct)
    }

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'products', id))
            setData(data.filter((item) => item.id !== id))
        } catch (err) {
            console.log(err)
        }
    }

    const handleEdit = (id) => {
        navigate('/products/edit', { state: id })
    }

    return (
        <div className="category">
            <div>
                <button onClick={() => setFilter(data)}>All</button>
                <button onClick={() => filterProduct('PC')}>PC</button>
                <button onClick={() => filterProduct('Điện thoại')}>Điện thoại</button>
                <button onClick={() => filterProduct('Bàn phím')}>Bàn phím</button>
                <button onClick={() => filterProduct('Chuột')}>Chuột</button>
                <button onClick={() => filterProduct('Tai nghe')}>Tai nghe</button>
                <button onClick={() => filterProduct('Laptop')}>Laptop</button>
                <button onClick={() => filterProduct('VGA')}>VGA</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                {filter.map((product) => {
                    return (
                        <div key={product.id} style={{ display: 'flex', gap: 10, flexDirection: 'column' }} className="productItem">
                            <div>
                                <img style={{ width: 100, height: 100 }} src={product.img[0].img} alt="" />
                                {/* <img style={{ width: 50, height: 50 }} src={product.img[1].img} alt="" /> */}
                            </div>
                            <h5>Tên sản phẩm: {product.title}</h5>
                            <p>Loại: {product.category}</p>
                            <p>Giá: {product.price}</p>
                            <p>Mô tả: {product.description}</p>
                            <p>Số lượng: {product.total}</p>
                            {/* <Link to={`/product/${product.id}`}>Buy Now</Link> */}
                            <div>
                                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="viewButton">View</div>
                                </Link>

                                <div className="viewButton" onClick={() => handleEdit(product.id)}>
                                    Edit
                                </div>

                                <div className="deleteButton" onClick={() => handleDelete(product.id)}>
                                    Delete
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Category
