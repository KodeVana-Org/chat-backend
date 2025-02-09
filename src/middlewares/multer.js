import multer from "multer";


//const storage = multer.diskStorage({
//    destination: (req, file, cb) => {
//        cb(null, "./src/uploads/")
//    },
//    filename: (req, file, cb) => {
//        cb(null, `${Date.now()}-${file.originalname}`)
//    },
//});

//here for storing media in uplaod for temperorary
//
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads")); // Save files to the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});


// create multer instance
const upload = multer({ storage })

export { upload }
