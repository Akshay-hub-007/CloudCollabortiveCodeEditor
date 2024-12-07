const getVirtualBoxFiles = async (id) => {
  // console.log("Fetching VirtualBox files for ID:", id); // Debug log

  try {
    const response = await fetch(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api?virtualboxId=${id}`);
    console.log("hii",response)
    if (!response.ok) {
      throw new Error("Failed to fetch VirtualBox files");
    }
  
    const virtualboxData = await response.json();
    console.log("Received VirtualBox data:", virtualboxData); // Log fetched data
  
    if (!virtualboxData || virtualboxData.length === 0) {
      return "Not Found"; // Return early if no data
    }
    
    const paths = virtualboxData.map((obj) => obj.fileId);
    return processFiles(paths, id);
  } catch (error) {
    console.error("Error fetching VirtualBox files:", error.message); // Improved error handling
    return null;
  }
};

// Process the file paths into a folder structure
const processFiles = async (paths, id) => {
  const root = {
    id: "/",
    type: "folder",
    name: "/",
    children: [],
  };

  const fileData = [];
  console.log("Processing file paths:", paths); // Debug log

  paths.forEach((path) => {
    const allParts = path.split("/");
    if (allParts[1] !== id) {
      return; // Skip paths that don't match the ID
    }

    const parts = allParts.slice(2); // Skip 'projects/{id}/'
    let current = root;

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1 && part.includes(".");
      const existing = current.children.find((child) => child.name === part);

      if (existing) {
        if (!isFile) {
          current = existing; // Continue traversing if it's an existing folder
        }
      } else {
        if (isFile) {
          // Create and add file node
          const file = { id: path, type: "file", name: part };
          current.children.push(file);
          fileData.push({ id: path, data: "" }); // Track files for async data fetching
        } else {
          // Create and add folder node
          const folder = {
            id: `projects/${id}/${parts.slice(0, i + 1).join("/")}`,
            type: "folder",
            name: part,
            children: [],
          };
          current.children.push(folder);
          current = folder; // Move into the newly created folder
        }
      }
    });
  });

  console.log("Fetching file data for all files..."); // Debug log
  // Fetch file data for all files
  await Promise.all(
    fileData.map(async (file) => {
      const data = await fetchFileContent(file.id);
      file.data = data || ""; // Assign file content or empty if failed
    })
  );

  console.log("Processed file structure:", root); // Debug log
  return { files: root.children, fileData };
};

// Fetch file content by ID
const fetchFileContent = async (fileId) => {
  try {
    console.log("Fetching content for file ID:", fileId); // Debug log
    const fileRes = await fetch(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api?fileId=${fileId}`);
    return await fileRes.text();
  } catch (err) {
    console.error("Error fetching file content for file ID:", fileId, err.message);
    return ""; // Return empty string if fetching fails
  }
};

module.exports = getVirtualBoxFiles;
