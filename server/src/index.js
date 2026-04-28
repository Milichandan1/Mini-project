import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

await connectDb();

app.listen(env.port, () => {
  console.log(`Voyage API listening on http://localhost:${env.port}/api`);
});
