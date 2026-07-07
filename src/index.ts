import app from "./app.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => {
    console.log("v2: Whatsapp bot server listening on port ", PORT);
});
