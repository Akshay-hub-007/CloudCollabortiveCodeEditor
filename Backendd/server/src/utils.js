const { default: Groq } = require("groq-sdk");

const renamedFile = async (fileId, newFileId, data) => {
   
    const res = await fetch("http://localhost:3000/api/rename", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fileId,
            newFileId,
            data
        })
    });
    console.log(res);
    return res.ok;
};
const saveFile = async (fileId, data) => {
    try {
        console.log("lorem*5ecefcevcevevevercercer")
      const res = await fetch("http://localhost:3000/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          data,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save file: ${res.statusText}`);
      }
      console.log("File saved successfully");
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  const createFile = async (fileId) => {
    try {
      const res = await fetch("http://localhost:3000/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save file: ${res.statusText}`);
      }
      console.log("File saved successfully");
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  
  const deleteFile = async (fileId) => {
    try {
      const res = await fetch("http://localhost:3000/api", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
        }),
      });
       console.log(res)
      if (!res.ok) {
        throw new Error(`Failed to delete file: ${res.statusText}`);
      }
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error during delete:", error);
    }
  };

  const groq = new Groq({ apiKey: "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" });
  async function getGroqChatCompletion(fileName, code, line, instructions) {
    console.log("1", fileName, "2", code, "3", line, "4", instructions);
    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert coding assistant who reads from an existing code file, and suggests code to add to the file. You may be given instructions on what to generate, which you should follow. You should generate code that is correct, efficient, and follows best practices. You should also generate code that is clear and easy to read.",
        },
        {
          role: "user",
          content: `The file is called ${fileName}.`,
        },
        {
          role: "user",
          content: `Here are my instructions on what to generate: ${instructions}.`,
        },
        {
          role: "user",
          content: `Suggest me code to insert at line ${line} in my file. Give only the code, and NOTHING else. DO NOT include backticks in your response. My code file content is as follows:\n\n${code}`,
        },
      ],
      model: "llama3-8b-8192",
    });
  }
  
  const generateCode = async ({fileName, code, line, instructions}) => {
    try {
      console.log("1", fileName, "2", code, "3", line, "4", instructions);
      const chatCompletion = await getGroqChatCompletion(fileName, code, line, instructions);
      console.log(chatCompletion.choices[0]?.message?.content || "No content returned.");
    
     return chatCompletion.choices[0]?.message?.content || "No content returned."
    } catch (error) {
      console.error("Error generating code:", error);
    }
  };
  
// generateCode("akshay.py", "", 0, "give me a toString function of student object contains name,age,dob");

  module.exports = { renamedFile, saveFile,createFile,deleteFile,generateCode };