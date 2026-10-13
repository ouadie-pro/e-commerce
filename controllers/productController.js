const product = require('../models/Products')

const addProduct = async(req,res)=>{
    try{
        const {name,description,price,image,category} = req.body;
        if (!name || !description || !price || !image || !category){
            return res.status(400).json({message:"empty"})
        }
        const newproduct = await product.create({
            name,
            description,
            price,
            image,
            category
        })
        return res.json(newproduct)
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message : err.message})
    }
}
 
const getAllProducts = async(req,res)=>{
    try{
        const products = await product.find({})
        return res.json(products)
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message : err.message})
    }
}

const deleteProduct = async(req,res)=>{
    try{
        const {id} = req.body;
        if (!id){
            return res.status(400).json({message:"empty"})
        }
        const product = await Product.findByIdAndDelete(id)
        return res.json(product)
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message : err.message})
    }
}

const editProduct = async(req,res)=>{
    try{
        const {id,name,description,price,image,category} = req.body;
        if (!id || !name || !description || !price || !image || !category){
            return res.status(400).json({message:"empty"})
        }
        const product = await Product.findByIdAndUpdate(id,{name,description,price,image,category})
        return res.json(product)
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message : err.message})
    }
}

module.exports = {addProduct,getAllProducts,deleteProduct,editProduct}