import React, { useRef, Suspense, lazy, useState, useEffect, Children } from 'react';
import { Button } from "../../components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../components/ui/resizable';
import { FileJson, Loader2, Plus, SquareTerminal, TerminalSquare, X } from "lucide-react";
import Sidebar from './sidebar/Index.jsx';
import { io } from "socket.io-client";
import { processFiles } from '../../lib/utils';
import { toast } from 'sonner';
import Tab from '../../components/ui/tab';
const Editor = lazy(() => import('@monaco-editor/react')); // Lazy loading the Editor
import EditorTerminal from '../editor/terminal/Terminal.jsx';
import "../../index.css"
import GenerateInput from './Generate';
import * as Y from "yjs"
import { MonacoBinding } from 'y-monaco';
import { useMyPresence, useRoom } from '../../liveblocks.config';
import { createId } from '@paralleldrive/cuid2';
// ... existing code ...
import LiveblocksProvider from "@liveblocks/yjs";
// ... rest of the imports ...import { Awareness } from 'y-protocols/awareness';
// import { useRoom } from '../../../src/liveblocks.config';
// import Avatar from '../../../src/components/ui/avatar';
import  {Cursors}  from './live/Cursors.jsx';
import { Awareness } from 'y-protocols/awareness';
import Disables from './live/Disables';
import PreviewWindow from './preview/PreviewWindow';
function CodeEditor({ userData, virtualboxData, isSharedUser }) {
  console.log(virtualboxData)
 
  const [editorRef, setEditorRef] = useState();
  const monacoRef = useRef(null)
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [files, setFiles] = useState([]);
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [activeFile, setActiveFile] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const [terminals, setTerminals] = useState([]);
  const [cursorLine, setCursorLine] = useState(0);
  const [generate, setGenerate] = useState({ show: false, id: "", width: 0, widget: undefined | undefined, line: 0, pref: [] })
  const [decorations, setDecorations] = useState({ options: [], instance: undefined })
  const [provider, setProvider] = useState();
  const editorContainerRef = useRef(null)
  const generateWidgetRef = useRef(null);
  const userId = userData["id"]
  const [activeterminalId, setActiveTerminalId] = useState("")
  const [creatingTerminal, setCreatingTerminal] = useState(false)
  const [ai, setAi] = useState(false)
  const [disableAccess, setDisableAccess] = useState({ isDisabled: false, message: "" })
  const [closingTerminal, setClosingTerminal] = useState("")
 const [deletingFolderId,setDeletingFolderId]=useState("")
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(
    virtualboxData?.type !== "react"
  );
  const previewPanelRef=useRef(null);
  let socket;
  console.log(userData,virtualboxData)
  const serverUrl = 'https://cloudcollabortivecodeeditor-1.onrender.com'
  useEffect(() => {
    if (userData && virtualboxData) {
      console.log(virtualboxData, userData.id)
      socketRef.current = io(`https://cloudcollabortivecodeeditor-2.onrender.com?userId=${userData.id}&virtualboxId=${virtualboxData.id}`);
      socket = socketRef.current;
      console.log(socket)
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width } = entry.contentRect
          setGenerate((prev) => {
            return { ...prev, width }
          })
        }
      })
      const onLoadedEvent = (files) => {
        console.log(files,"ubububuhyn");
        setFiles(files);
      };
      if (editorContainerRef.current) {
        resizeObserver.observe(editorContainerRef.current)
      }
      const onConnect = () => {
        //  createTerminal()
      };
      const onDisconnect = () => {
        setTerminals([])
      };

      const onRateLimit = (message) => {
        toast.error(message)
      }
      const onTerminalResponse = (response) => {
        // console.log(response)
        // const res = response.data
        // console.log("terminal response", res)
        const term = terminals.find((t) => t.id === response.id)
        if (term && term.terminal) term.terminal.write(response.data)
      }
      const onDisabledAccess = (message) => {
        setDisableAccess({
          isDisabled: true,
          message: message
        })
      }

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("loaded", onLoadedEvent);
      console.log(socket)

      socket.on("connect_error", (err) => {
        console.error("Connection failed:", err.message);
      });
      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
      });
      socket.on("rateLimit", onRateLimit)
      // socket.on("terminalResponse", onTerminalResponse);
      socketRef.current.on("terminalResponse", onTerminalResponse);
      socket.on("disabledAccess", onDisabledAccess);
      return () => {
        if (socketRef.current) {
          socket.off("loaded", onLoadedEvent);
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);

          // terminals.forEach((term)=>{
          //   if(term.terminal)
          //   {
          //     term.terminal.dispose()
          //   }
          // })
          socket.off("connect_error");
          socket.off("error");
          socket.off("rateLimit", onRateLimit)
          socket.off("disabledAccess", onDisabledAccess)
          resizeObserver.disconnect();
        }
      };
    }
  }, [userId, virtualboxData, terminals]);

  const closeAllTerminals = () => {
    terminals.forEach((term) => {
      socket.emit("closeTerminal", term.id, () => {
        setTerminals((prev) => prev.filer((t) => t.id === term.id))

      })
    })
  }
  const activeTerminal = terminals.find((t) => t.id == activeterminalId)
  const handleDeleteFile = (file) => {
    socketRef.current.emit("deleteFile", file.id, (response) => {
      setFiles(response);
    });
    closeTab(file.id);
  };
  const createTerminal = () => {
    // if (creatingTerminal) return; // Prevent duplicate creation calls
    setCreatingTerminal(true);

    const id = createId();
    setTerminals((prev) => [...prev, { id, terminal: null }])
    setActiveTerminalId(id)
    setTimeout(() => {
      socketRef.current.emit("createTerminal", id, () => {
        // console.log(res);

        setCreatingTerminal(false)
      });
    }, 1000);

  };

  // const closeTerminal = (term) => {
  //   const numTerminals = terminals.length
  //   const index = terminals.findIndex((t) => t.id === term.id)
  //   if (index === -1) return

  //   socket.emit("closeTerminal", term.id, (res) => {
  //     if (!res) {
  //       const nextId = activeterminalId === term.id
  //         ? numTerminals === 1 ?
  //           null
  //           : index < numTerminals - 1
  //             ? terminals[index + 1].id
  //             : terminals[index - 1].id
  //         : activeterminalId
  //       setTerminals((prev) => prev.filter((t) => t.id !== term.id));

  //       if (!nextId) {
  //         setActiveTerminalId("")
  //       }
  //       else {
  //         const nextTerminal = terminals.find((t) => t.id === nextId)
  //         if (nextTerminal) {
  //           setActiveTerminalId(nextTerminal.id)
  //         }
  //       }
  //     }
  //   })
  // }
  const closeTerminal = (term) => {
    const numTerminals = terminals.length
    const index = terminals.findIndex((t) => t.id === term.id)
    if (index === -1) return

    setClosingTerminal(term.id);
    socketRef.current.emit("closeTerminal", term.id, () => {
      // Remove the condition or reverse it depending on your server response
      setClosingTerminal("")
      const nextId = activeterminalId === term.id
        ? numTerminals === 1
          ? null
          : index < numTerminals - 1
            ? terminals[index + 1].id
            : terminals[index - 1].id
        : activeterminalId

      if(activeTerminal && activeTerminal.terminal)
      {
        activeTerminal.terminal.dispose()
      }
      setTerminals((prev) => prev.filter((t) => t.id !== term.id));
      if (!nextId) {
        setActiveTerminalId("")
      }
      else {
        const nextTerminal = terminals.find((t) => t.id === nextId)
        if (nextTerminal) {
          setActiveTerminalId(nextTerminal.id)
        }
      }
    })
  }
  const handleRename = (id, newName, oldName, type) => {
    const trimmedNewName = newName.trim();
    if (
      trimmedNewName === oldName ||
      trimmedNewName.includes("/") ||
      trimmedNewName.includes("\\") ||
      trimmedNewName.includes(" ") ||
      (type === "file" && !trimmedNewName.includes(".")) ||
      (type === "folder" && trimmedNewName.includes("."))
    ) {
      toast.error("Invalid file name");
      return false;
    }

    socketRef.current.emit("renameFile", id, trimmedNewName);
    setTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, name: trimmedNewName } : tab)));
    return true;
  };

  const selectFile = (tab) => {
    console.log(tab)
    setLoading(true);
    if (tab.id === activeId) return
    const exists = tabs.find((t) => t.id === tab.id)
    setTabs((prev) => {
      if (exists) {
        setActiveId(exists.id);
        return prev;
      }
      return [...prev, tab];
    });

    socketRef.current.emit("getFile", tab.id, (response) => {
      console.log(response)
      setActiveFile(response);
      setLoading(false);
    });

    setEditorLanguage(processFiles(tab.name));
    setActiveId(tab.id);
  };

  const closeTab = (id) => {
    const numTabs = tabs.length;
    const index = tabs.findIndex((t) => t.id === id);
    if (index === -1) return;
    const nextId =
      activeId === id
        ? numTabs === 1
          ? null
          : index < numTabs - 1
            ? tabs[index + 1].id
            : tabs[index - 1].id
        : activeId;


    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (!nextId) {
      setActiveId("")
    } else {
      const nextTab = tabs.find((t) => t.id === nextId);
      if (nextTab) selectFile(nextTab);
    }
  };
  const room = useRoom()

  useEffect(() => {
    const tab = tabs.find((t) => t.id === activeId);
    const model = editorRef?.getModel();

    if (!editorRef || !tab || !model) return;

    const yDoc = new Y.Doc();
    const yText = yDoc.getText(tab.id);
    const yProvider = new LiveblocksProvider(room, yDoc);

    const onSync = (isSynced) => {
      // const isSynced = isSynced; // Make sure isSynced is defined here if needed
      if (isSynced) {
        const text = yText.toString();
        if (text === "") {
          if (activeFile) {
            yText.insert(0, activeFile);
          } else {
            setTimeout(() => {
              yText.insert(0, editorRef?.getValue());
            }, 0);
          }
        }
      }
    };

    yProvider.on("sync", onSync(true));

    setProvider(yProvider);

    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editorRef]),
      yProvider.awareness
    );

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
      binding?.destroy();
      yProvider.off("sync", onSync);
    };
  }, [editorRef, room, activeFile]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        setTabs((prev) => prev.map((tab) => (tab.id === activeId ? { ...tab, saved: true } : tab)));

        if (editorRef) {
          const fileContent = editorRef.getValue();
          socketRef.current.emit("saveFile", activeId, fileContent);
        } else {
          console.error("Editor not initialized");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, editorRef, socketRef]);

  const closeTabs=(ids)=>{
    const numTabs=tabs.length
    if(numTabs===0) return
    const allIndexes=ids.map((id)=>tabs.findIndex((t)=>t.id===id))

    const indexes=allIndexes.filter((index)=> index!=-1)
    if(indexes.length===0)
    {
      return
     }
  
     const activeIndex=tabs.findIndex((t)=>t.id===activeId)
   
     const newtabs=tabs.filter((t)=> !ids.includes(t.id))
     setTabs(newtabs)
     if(indexes.length===numTabs)
     {
      setActiveId("")
     }else{
      const nextTab=newtabs.length>activeIndex ? newtabs[activeIndex] :newtabs[newtabs.length]

      if(nextTab)
      {
     selectFile(nextTab)
      }

  
     }
    } 


  const handleDeleteFolder = (folder) => {
     setDeletingFolderId(folder.id)
       
     socketRef.current.emit("getFolder",folder.id,(res)=>{
       closeTabs(res)
     })

     socketRef.current.emit("deleteFolder",folder.id,(response)=>{
        setFiles(response)
        setDeletingFolderId("")
     })
  setTimeout(()=>{
     setDeletingFolderId("")
  },3000)
    };
  const generateRef = useRef(null);
  const handleEditorWillMount = (monaco) => {
    monaco.editor.addKeybindingRules([
      {
        keybinding: monaco.KeyMod.Ctrlcmd | monaco.KeyCode.KeyG,
        key: null,
      }
    ])
  }

  useEffect(() => {
    if (!ai) {
      setGenerate((prev) => {
        return {
          ...prev,
          show: false
        }
      })
      return
    }
    if (generate.show) {
      editorRef?.changeViewZones((changeAccessor) => {
        if (!generateRef.current) return;
        const id = changeAccessor.addZone({
          afterLineNumber: cursorLine,
          heightInLines: 3,
          domNode: generateRef.current,
        });

        setGenerate((prev) => {
          return { ...prev, id, line: cursorLine };
        });
      });

      if (!generateWidgetRef.current) return;

      const widgetElement = generateWidgetRef.current;

      const contentWidget = {
        getDomNode: () => {
          return widgetElement;
        },
        getId: () => {
          return 'generate.widget';
        },
        getPosition: () => {
          return {
            position: {
              lineNumber: cursorLine,
              column: 1,
            },
            preference: generate.pref,
          };
        },
      };

      setGenerate((prev) => {
        return { ...prev, widget: contentWidget };
      });

      editorRef?.addContentWidget(contentWidget);

      if (generateRef.current && generateWidgetRef.current) {
        editorRef?.applyFontInfo(generateRef.current);
        editorRef?.applyFontInfo(generateWidgetRef.current);
      }
    } else {
      editorRef?.changeViewZones((changeAccessor) => {
        changeAccessor.removeZone(generate.id);
        setGenerate((prev) => {
          return { ...prev, id: '' };
        });
      });

      if (!generate.widget) return;
      editorRef?.removeContentWidget(generate.widget);
      setGenerate((prev) => {
        return {
          ...prev,
          widget: undefined,
        };
      });
    }
  }, [generate.show]);
  useEffect(() => {
    if (decorations.options.length === 0) {
      decorations.instance?.clear()
    }
    if (!ai) return
    if (decorations.instance) {
      decorations.instance.set(decorations.options)
    }
    else {
      const instance = editorRef?.createDecorationsCollection()
      instance?.set(decorations.options);
      setDecorations((prev) => {
        return {
          ...prev,
          instance,
        }
      })
    }
  }, [decorations.options])
  // const createTerminal=()=>{
  //   const id="testId"
  //   socket.emit("createTerminal",{id})
  // }
  // console.log(socket)


  // if (!disableAccess.isDisabled) {
  //   return (
  //     <>
  //       <Disables
  //         message={disableAccess.message}
  //         open={disableAccess.isDisabled}
  //         setOpen={() => { }}></Disables>
  //     </>
  //   )
  // }
  console.log(files)
  return (
    <>
      <div ref={generateRef} />
      <div className="z-50 p-1" ref={generateWidgetRef}>
        {
          socketRef.current && generate.show && ai ? (
            <GenerateInput
              user={userData}
              data={{
                fileName: tabs.find((t) => t.id === activeId)?.name ?? "",
                code: editorRef?.getValue() ?? "",
                line: generate.line,
              }}
              editor={{
                language: !editorLanguage,
              }}
              cancel={() => { }}
              submit={(str) => { }}
              width={generate.width - 90}
              onExpand={() => {
                editorRef?.changeViewZones((changeAccessor) => {
                  changeAccessor.removeZone(generate.id);

                  if (!generateRef.current) return;

                  const id = changeAccessor.addZone({
                    afterLineNumber: cursorLine,
                    heightInLines: 12,
                    domNode: generateRef.current,
                  });

                  setGenerate((prev) => ({
                    ...prev,
                    id,
                  }));
                });
              }}
              onAccept={(code) => {
                const line = generate.line;
                setGenerate((prev) => ({
                  ...prev,
                  show: !prev.show,
                }));
                console.log("accepted:", code);
                const file = editorRef?.getValue();

                const lines = file?.split("\n") || [];
                lines.splice(line - 1, 0, code);
                const updatedFile = lines.join("\n");
                editorRef?.setValue(updatedFile);
              }}
              socket={socketRef.current}
            />

          ) : null
        }
      </div>
      <Sidebar
        virtualboxData={virtualboxData}
        setFiles={setFiles}
        files={files} 
        selectFile={selectFile}
        handleRename={handleRename}
        handleDeleteFile={handleDeleteFile}
        handleDeleteFolder={handleDeleteFolder}
        socket={socketRef.current}
        addNew={(name, type) => {
          if (type === "file") {
            setFiles((prev) => [
              ...prev,
              { id: `projects/${virtualboxData.id}/${name}`, name, type: "file" },
            ]);
          } else {
       setFiles(prev=>[...prev,
                     {id:`projects/${virtualboxData.id}/${name}`,
                     name,
                     type:"folder",
                     children:[]
                    }
                  ])
          }
        }}
        ai={ai}
        setAi={setAi}
        deletingFolderId={deletingFolderId}
      />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel maxSize={80} minSize={30} defaultSize={60} className="flex flex-col p-2 border-gradient">
          <div className="h-10 w-full flex gap-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                saved={tab.saved}
                selected={activeId === tab.id}
                onClick={() => selectFile(tab)}
                onClose={() => closeTab(tab.id)}
              >
                {tab.name}
              </Tab>
            ))}
          </div>
          <div ref={editorContainerRef} className="grow w-full overflow-hidden rounded-lg relative">
            {!activeId ? (
              <div className="flex items-center w-full h-full justify-center text-xl font-medium">
                <FileJson /> No file selected
              </div>
            ) : (
              <>
                {provider ? <Cursors yProvider={provider} /> : null}
                <Suspense fallback={<div>Loading Editor...</div>}>
                  <Editor
                    height={"100%"}
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    beforeMount={(monaco) => {
                      monacoRef.current = monaco;
                    }}
                    onMount={(editor) => {
                      setEditorRef(editor)
                      setTimeout(() => {

                      }, 5000)

                      editor.onDidChangeCursorPosition((e) => {
                        const { lineNumber, column } = e.position;
                        if (lineNumber !== cursorLine) setCursorLine(lineNumber);
                        const editorPosition = editor.getScrolledVisiblePosition({ lineNumber, column });

                        // if (editorPosition) {
                        //   useMyPresence                      ({
                        //     cursor: {
                        //       x: editorPosition.left,
                        //       y: editorPosition.top
                        //     }
                        //   });
                        // }
                        const model = editor.getModel();
                        const endColumn = model ? model.getLineContent(lineNumber).length : 0;

                        setDecorations((prev) => ({
                          ...prev,
                          options: [
                            {
                              range: new monacoRef.current.Range(lineNumber, column, lineNumber, endColumn),
                              options: {
                                afterContentClassName: "inline-decoration",
                              },
                            },
                          ],
                        }));
                      });

                      editor.onDidBlurEditorText(() => {
                        setDecorations((prev) => ({
                          ...prev,
                          options: [],
                        }));
                        // updateMyPresence({
                        //   cursor: null
                        // });
                      });

                      editor.addAction({
                        id: "generate",
                        label: "Generate",
                        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
                        precondition:
                          "editorTextFocus && !suggestWidgetVisible && !renameInputVisible && !inSnippetMode && !quickFixWidgetVisible",
                        run: () => {
                          setGenerate((prev) => {
                            return {
                              ...prev,
                              show: !prev.show,
                              pref: [monaco.editor.ContentWidgetPositionPreference.BELOW],
                            };
                          });
                        },
                      });

                    }}
                    onChange={(value) => {
                      if (value === activeFile) {
                        setTabs((prev) => prev.map((tab) => (tab.id === activeId ? { ...tab, saved: true } : tab)));
                      } else {
                        setTabs((prev) => prev.map((tab) => (tab.id === activeId ? { ...tab, saved: false } : tab)));

                      }
                    }}
                    language={editorLanguage}
                    options={{
                      minimap: { enabled: false },
                      padding: { bottom: 4, top: 4 },
                      scrollBeyondLastColumn: false,
                      fixedOverflowWidgets: true,
                      fontFamily: "var(--font-geist-mono)",
                    }}
                    value={loading ? "" : activeFile}
                  />
                </Suspense>
              </>
            )}
          </div>

        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80} className="border-gradient">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel  ref={previewPanelRef} 
                            collapsedSize={4}
                              defaultSize={50}
                               minSize={50}
                               collapsible
                               onCollapse={()=>setIsPreviewCollapsed(true)}
                               onExpand={()=> setIsPreviewCollapsed(false)}
                                className="p-2 flex flex-col border-gradient">
             <PreviewWindow collapsed={isPreviewCollapsed} open={()=>{
               previewPanelRef.current?.expand();
               setIsPreviewCollapsed(false)
             }}></PreviewWindow>
             </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel 
                      defaultSize={50} 
                      minSize={25} 
                      className="p-2 flex flex-col border-gradient"
                       
                      >
        
              <div className="h-10 w-full flex gap-2 shrink-0 overflow-auto tab-scroll">

                {terminals.map((term) => (
                  <Tab
                    key={term.id}
                    onClick={() => setActiveTerminalId(term.id)}
                    onClose={() => closeTerminal(term)}
                    selected={activeterminalId === term.id}
                  >
                    <SquareTerminal className='w-4 h-4 mr-2' />
                    Shell
                  </Tab>
                ))}

                <Button
                  disabled={creatingTerminal}
                  onClick={() => {
                    if (terminals.length > 4) {
                      toast.error("you reached maximun number of terminals")
                      return
                    }
                    console.log("hello")
                    createTerminal()
                  }}
                  size={"sm"}
                  variant={"foreground"}
                  className="font-normal shrink-0 select-none text-muted-foreground"
                >
                  {creatingTerminal ? (
                    < Loader2 className="animate-spin w-4 h-4" />
                  ) : <Plus className="w-4 h-4" />
                  }
                </Button>

              </div>
              {socketRef.current && activeTerminal ? (
                <div className="w-full grow rounded-lg bg-gray">
                  {terminals.map((term) => (
                    <EditorTerminal
                      key={term.id}
                      socket={socketRef.current}
                      id={activeterminalId.id}
                      term={activeTerminal.terminal}
                      setTerm={(t) => setTerminals((prev) =>
                        prev.map((term) => term.id === activeterminalId ? { ...term, terminal: t } : term)
                      )}
                      visible={activeterminalId===term.id}
                    />
                  ))}
                </div>
              ) : (
                <div className='w-full h-full flex items-center justify-center text-lg font-medium text-muted-foreground/50 select-none'>
                  <TerminalSquare className='w-4 h-4 mr-2' />
                  No terminals Open
                </div>
              )}


            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

    </>
  );
}


export default CodeEditor;
