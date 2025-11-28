const multer = require("multer");
const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");

const mongoURI = "mongodb+srv://avril:AdatabaseORT2026@cluster0.rznkvjp.mongodb.net/";
const dbName = "PlatsDB";

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
            resolve(uploadStream.id);
            client.close();
        });

        uploadStream.on("error", (err) => {
            reject(err);
            client.close();
        });
    });
}

async function downloadFile(fileId) {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: "documentos" });

    try {
        const objectId = new ObjectId(fileId);
        
        const files = await bucket.find({ _id: objectId }).toArray();
        
        if (!files || files.length === 0) {
            client.close();
            return null;
        }

        const file = files[0];
        const downloadStream = bucket.openDownloadStream(objectId);

        return {
            stream: downloadStream,
            filename: file.filename,
            contentType: file.contentType || 'application/pdf',
            closeConnection: () => client.close()
        };

    } catch (error) {
        client.close();
        throw error;
    }
}

module.exports = { upload, uploadFile, downloadFile };