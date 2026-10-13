const Client = require('../models/Clients')

const addClient = async(req,res)=>{
    try{
        const {fullname,phone,city,address} = req.body;
        if (!fullname || !phone || !city || !address){
            return res.status(400).json({message:"empty"})
        }
        const newclient = await Client.create({
            fullname,
            phone,
            city,
            address
        })
        return res.json(newclient)
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message : err.message})
    }
}
 
module.exports = {addClient}