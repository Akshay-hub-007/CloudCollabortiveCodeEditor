const {RateLimiterMemory}=require("rate-limiter-flexible")
 const MAX_BODY_SIZE = 5 * 1024 * 1024;

 const saveFileRL = new RateLimiterMemory({
  points: 3,
  duration: 1,
});

 const createFileRL = new RateLimiterMemory({
  points: 3,
  duration: 1,
});

 const renameFileRL = new RateLimiterMemory({
  points: 3,
  duration: 1,
});

 const deleteFileRL = new RateLimiterMemory({
  points: 3,
  duration: 1,
});

 const deleteFolderRL = new RateLimiterMemory({
  points: 1,
  duration: 2,
});

 const createFolderRL = new RateLimiterMemory({
  points: 1,
  duration: 2,
});
module.exports={createFolderRL,deleteFolderRL,deleteFileRL,renameFileRL,createFileRL,saveFileRL,MAX_BODY_SIZE}