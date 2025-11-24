// upload.js
const multer = require("multer");
const { MongoClient, GridFSBucket } = require("mongodb");

const mongoURI = "mongodb+srv://avril:AdatabaseORT2026@cluster0.rznkvjp.mongodb.net/"; // tu URI
const dbName = "PlatsDB"; // cambialo según tu DB

// Configuración de Multer para memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function uploadFile(file) {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: "documentos" });

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname);
        uploadStream.end(file.buffer);

        uploadStream.on("finish", () => {
            resolve(uploadStream.id); // devuelve el id del archivo
            client.close();
        });

        uploadStream.on("error", (err) => {
            reject(err);
            client.close();
        });
    });
}

module.exports = { upload, uploadFile };
