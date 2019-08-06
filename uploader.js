const { stat, createWriteStream, createReadStream, writeFile, exists } = require('fs');
var { promisify } = require('util');
var multiparty = require('multiparty');
var path = require('path');
var createFile = promisify(writeFile);
var url = require('url');
var videos = require('./lib/.data/videos.json');
var fileExist = promisify(exists);
function upload(req, res) {
    // return new Promise((resolve, reject) => {
    var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        files.file.map(currentFile => {
            var nameSplit = currentFile.path.split('\\')
            var filename = nameSplit[nameSplit.length - 1];
            var id = filename.replace(/\.[a-zA-Z\d]+/i, "");
            var fileObject = {
                originalName: currentFile.originalFilename,
                size: currentFile.size,
                name: filename,
                id: id
            }
            videos.push(fileObject);
            createFile(path.join(__dirname, './lib/.data/videos.json'), JSON.stringify(videos))
                .then(result => {
                    var fileStream = createWriteStream(`./uploads/${filename}`);
                    createReadStream(currentFile.path).pipe(fileStream)
                        .on('error', (error) => sendResponse(false, res, error))
                        .on('close', () => sendResponse(true, res));
                }).catch(error => sendResponse(false, res, error));
        })
        // })
    });
}

async function streamVideo(req, res) {
    var { query } = url.parse(req.url, true);
    console.log("query", Object.keys(query).map(key => {
        return [key, query[key]]
    }))
    var index = videos.findIndex(x => x.id === query.name);
    if (index > -1) {
        var filename = path.join(__dirname, `./uploads/${videos[index].name}`);
        console.log("checking index", filename);
        var exists = await fileExist(filename);
        if (exists) {
            var readStream = createReadStream(filename);
            let range = req.headers.range;
            if(range){
                //stream video with range
                streamVideoWithRange(filename, videos[index].size, range, res);
            }else{
                //stream video without range
                streamVideoWithoutRange(filename,videos[index].size, res);
            }

        } else {
            res.end(JSON.stringify({ success: false, message: "no video found" }));
        }
    } else {
        res.end(JSON.stringify({ success: false, message: "no video found" }));
    }
}

function streamVideoWithRange(fileName, size,  range, res){
    let [start, end] = range.replace(/bytes=/, '').split('-');
      start = parseInt(start, 10);
      end = end ? parseInt(end, 10) : size - 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': (end - start) + 1,
        'Content-Type': 'video/mp4'
      })
      createReadStream(fileName, { start, end }).pipe(res);
}
function streamVideoWithoutRange(fileName,size, res){
    res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': 'video/mp4'
          });
          createReadStream(fileName).pipe(res);
}

function sendResponse(success, res, error) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (success) {
        res.end(JSON.stringify({ success: true, message: "successfully uploaded data" }))
    } else {
        res.end(JSON.stringify({ data: error, message: 'something went wrong', success: false }))
    }
}
module.exports = { upload: upload, streamVideo: streamVideo };
