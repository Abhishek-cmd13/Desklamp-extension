const express = require('express')
const fileUpload = require('express-fileupload')
const path = require('path')
const { writeFileSync , readFileSync } = require("fs");
const { PDFDocument } = require("pdf-lib");
const app = express()

app.set('view engine', 'ejs')

async function appendPDF(SavePath) {
  
  var pdfone = await PDFDocument.load(readFileSync(SavePath[0]));
  console.log(SavePath[0])
  var pagesArray =[]
  var i = 0
  for( i=0 ; i< SavePath.length-1;i++ ){
    setTimeout(100)
    console.log(SavePath[i+1])
    var pdf = await PDFDocument.load(readFileSync(SavePath[i+1]))
    var pagesArray = await pdfone.copyPages(pdf, pdf.getPageIndices());
  }

    for (const page of pagesArray) {
      pdfone.addPage(page);}
   
  
 
  writeFileSync("DeskLamp-combined4.pdf", await pdfone.save());
 

}

// async function appendPDF(SavePath) {
  
//   const letters = await PDFDocument.load(readFileSync(SavePath[1]));
//   const janeDoe = await PDFDocument.load(readFileSync(SavePath[0]));

//   const pagesArray = await letters.copyPages(janeDoe, janeDoe.getPageIndices());

//   for (const page of pagesArray) {
//     letters.addPage(page);
//   }
 
//   writeFileSync("DeskLamp-combined2.pdf", await letters.save());
 

// }



app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp'),
    createParentPath: true,
    limits: { fileSize: 2 * 1024 * 1024 },
  })
)

app.get('/', async (req, res, next) => {
  res.render('index')
})

app.post('/single', async (req, res, next) => {
  try {
    const file = req.files.mFile
    console.log(file)
    const fileName = new Date().getTime().toString() + path.extname(file.name)
    const savePath = path.join(__dirname, 'public', 'uploads', fileName)
    if (file.truncated) {
      throw new Error('File size is too big...')
    }
    if (file.mimetype !== 'image/jpeg') {
      throw new Error('Only jpegs are supported')
    }
    await file.mv(savePath)
    res.redirect('/')
  } catch (error) {
    console.log(error)
    res.send('Error uploading file')
  }
})

app.post('/multiple', async (req, res, next) => {
  try {
    const files = req.files.mFiles

    // files.forEach(file => {
    //   const savePath = path.join(__dirname, 'public', 'uploads', file.name)
    //   await file.mv(savePath)
    // })

    let promises = []
    let SavePath=[]
    files.forEach((file) => {
      const savePath = path.join(__dirname, 'public', 'uploads', file.name)
      promises.push(file.mv(savePath))
      console.log("Uploading Done")
      SavePath.push(savePath)
    })

    // const promises = files.map((file) => {
    //   const savePath = path.join(__dirname, 'public', 'uploads', file.name)
    //   return file.mv(savePath)
   
    // })

    await Promise.all(promises)
    console.log(SavePath)
    await appendPDF(SavePath).catch((err) => console.log(err));
    res.redirect('/')
    SavePath =[]
    console.log(SavePath)
  } catch (error) {
    console.log(error)
    res.send('Error uploading files...')
  }
})

app.listen(8000, () => console.log('🚀 server on port 8000'))

