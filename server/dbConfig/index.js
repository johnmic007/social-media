import mongoose from "mongoose";


const dbConnection =async ()=>{
  try{

    const connection =await mongoose.connect(process.env.MONGODB_URL,{
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log("DB connected sucessfully")

  }catch(error){
     console.log("db error "+error)
  }
}


export default dbConnection;