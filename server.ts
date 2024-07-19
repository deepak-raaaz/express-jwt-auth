import { app } from "./app";
require("dotenv").config();
import connectDB from "./utlis/db";

// create server
app.listen(8080, () => {
  console.log(`server is connected with port ${process.env.PORT}`);
  connectDB();
});
