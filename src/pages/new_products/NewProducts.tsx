import './newproducts.scss'
import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined'
import { useEffect, useState, ChangeEvent } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '../../firebase/firebase'
// import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Backdrop, CircularProgress } from '@mui/material'

const NewProducts = () => {
    const [file, setFile] = useState<any[]>([])
    const [img, setImg] = useState<any[]>([])
    const [per, setPerc] = useState<null | number>(null)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    console.log(file)

    useEffect(() => {
        const uploadFile = () => {
            file.forEach((image) => {
                const name = image && new Date().getTime() + image.name

                const storageRef = image && ref(storage, image.name)
                const uploadTask = (storageRef && image && uploadBytesResumable(storageRef, image)) as UploadTask

                uploadTask &&
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            console.log('Upload is ' + progress + '% done')
                            setPerc(progress)
                            switch (snapshot.state) {
                                case 'paused':
                                    console.log('Upload is paused')
                                    break
                                case 'running':
                                    console.log('Upload is running')
                                    break
                                default:
                                    break
                            }
                        },
                        (error) => {
                            console.log(error)
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                setImg((prev) => [...prev, { img: downloadURL }])
                            })
                        }
                    )
            })
        }
        file && uploadFile()
    }, [file])
    type FormValues = {
        title: string
        file: string
        description: string
        category: string
        price: string
        email: string
        total: string
    }

    const handleAdd: SubmitHandler<FormValues> = async (data) => {
        const dataNew = { ...data, img: [...img] }
        console.log(dataNew)
        console.log(img)
        setLoading(true)

        try {
            await addDoc(collection(db, 'products'), {
                ...dataNew,
                timeStamp: serverTimestamp(),
            })
            navigate(-1)
        } catch (err) {
            console.log(err)
            setError(true)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        for (let i = 0; i < e.target.files!.length; i++) {
            const newImage = e.target.files![i]
            setFile((prev) => [...prev, newImage])
        }
    }

    const handleDeleteImage = (id: any) => {
        setFile(file.filter((image, index) => index != id))
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>()

    return (
        <div className="new">
            <Sidebar />
            <div className="newContainer">
                <Navbar />
                <div className="top">
                    <h1>Add New Products</h1>
                </div>
                {loading ? (
                    <Backdrop
                        sx={{
                            color: '#fff',
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                        }}
                        open={true}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                ) : (
                    <div className="bottom">
                        <div className="left">
                            {file.length > 0 ? (
                                file.map((image, index) => (
                                    <>
                                        <img key={index} src={URL.createObjectURL(image)} alt="" />
                                        <button onClick={() => handleDeleteImage(index)}>X</button>
                                    </>
                                ))
                            ) : (
                                <img src={'https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg'} alt="" />
                            )}
                        </div>
                        <div className="right">
                            <form onSubmit={handleSubmit(handleAdd)}>
                                <div className="formInput-wrap">
                                    <div className="formInput">
                                        <label htmlFor="file">
                                            Image: <DriveFolderUploadOutlinedIcon className="icon" />
                                        </label>
                                        <input
                                            multiple
                                            id="file"
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleChange}
                                            // {...register('file', {
                                            //     required: 'Vui lòng chọn ảnh sản phẩm',
                                            // })}
                                        />
                                        {/* {errors.file && (
                                        <p className="messages">{errors.file.message}</p>
                                    )} */}
                                    </div>
                                    <div className="formInput">
                                        <label>Product name</label>
                                        <input
                                            id="title"
                                            type="text"
                                            placeholder="Apple Macbook Pro"
                                            {...register('title', {
                                                required: 'Vui lòng nhập tên sản phẩm',
                                            })}
                                        />
                                        {errors.title && <p className="messages">{errors.title.message}</p>}
                                    </div>

                                    <div className="formInput">
                                        <label>Description</label>
                                        <textarea
                                            id="description"
                                            placeholder="Description"
                                            {...register('description', {
                                                required: 'Vui lòng nhập thông tin chi tiết sản phâm',
                                            })}
                                        ></textarea>
                                        {errors.description && <p className="messages">{errors.description.message}</p>}
                                    </div>

                                    <div className="formInput">
                                        <label>Category</label>
                                        <select
                                            id="category"
                                            {...register('category', {
                                                required: 'Vui lòng chọn loại',
                                            })}
                                        >
                                            <option value="">None</option>
                                            <option value="PC">PC</option>
                                            <option value="Điện thoại">Điện thoại</option>
                                            <option value="Laptop">Laptop</option>
                                            <option value="Chuột">Chuột</option>
                                        </select>
                                        {errors.category && <p className="messages">{errors.category.message}</p>}
                                    </div>
                                    <div className="formInput">
                                        <label>Price</label>
                                        <input
                                            id="price"
                                            type="text"
                                            placeholder="1000000VND"
                                            {...register('price', {
                                                required: 'Vui lòng nhập giá',
                                                pattern: {
                                                    value: /\d+/,
                                                    message: 'Vui lòng nhập giá',
                                                },
                                            })}
                                        />
                                        {errors.price && <p className="messages">{errors.price.message}</p>}
                                    </div>
                                    <div className="formInput">
                                        <label>Total In Store</label>
                                        <input
                                            id="total"
                                            type="text"
                                            placeholder="180"
                                            {...register('total', {
                                                required: 'Vui lòng nhập tổng số lượng',
                                                pattern: {
                                                    value: /\d+/,
                                                    message: 'Vui lòng nhập tổng số lượng',
                                                },
                                            })}
                                        />
                                        {errors.total && <p className="messages">{errors.total.message}</p>}
                                    </div>
                                </div>
                                {error && <p className="messageSubmit">Đã có sản phẩm trên hệ thống</p>}
                                <button disabled={per !== null && per < 100} type="submit">
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewProducts
