# videoUploader
This is a video upload api which a user can upload a video and also get the video by streaming in buffers.

## Setting up
* Run the command after you cd into the folder directory

```
npm install or yarn 

```
to install the dependencies (multiparty)
`

## End points

### upload

To consume the upload endpoint, send a POST request to http://localhost:3001/ using postman , with input name as file , using a form-data request method

### get/ stream video

To consume the upload endpoint, send a Get request http://localhost:3001/stream?name=id , via your browser url 
       
## Video Id : to get the video id ,
#Open the folders : lib/data/videos.json ,
      copy the uniqueId in the name  
      ```
        "originalName": "Game of Thrones - S08E06 HD (TvShows4Mobile.Com).mp4",
        "size": 122889673,
        "name": "gRC7RbA4C6SHFfdFSKKjggcV.mp4",
        "id": "gRC7RbA4C6SHFfdFSKKjggcV"
        ```
        
## Dependencies

* multiparty: For file upload

## Author
Ochoko  chukwuEbuka peter
