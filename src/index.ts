import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });
import app from "./app";

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
