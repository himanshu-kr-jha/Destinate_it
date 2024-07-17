const mongoose=require("mongoose");
const Listing =require("../models/listing.js");
const initData=require("./data.js")
const MONGOURL="mongodb://127.0.0.1:27017/Madhuravas"
main()
.then(()=>{
    console.log("connected successfully");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGOURL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();
