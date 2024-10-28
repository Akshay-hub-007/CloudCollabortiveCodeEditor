export function TFile(id, name) {
    this.id = id;
    this.type = 'file'; // Fixed to "file"
    this.name = name;
  }
  
  // Constructor for TFolder
  export function TFolder(id, name, children = []) {
    this.id = id;
    this.type = 'folder'; // Fixed to "folder"
    this.name = name;
    this.children = children; // Array of TFolder or TFile objects
  }
  
  // Constructor for TTab (inherits from TFile)
 export  function TTab(id, name, saved) {
    TFile.call(this, id, name); // Call TFile constructor
    this.saved = saved; // Additional property
  }