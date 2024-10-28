import React, { useRef, Suspense, lazy, useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../components/ui/resizable';
import { FileJson, Plus, SquareTerminal, X } from "lucide-react";
import Sidebar from './sidebar/Index.jsx';
import { io } from "socket.io-client";
import { processFiles } from '../../lib/utils';
import { toast } from 'sonner';
import Tab from '../../components/ui/tab';
const Editor = lazy(() => import('@monaco-editor/react')); // Lazy loading the Editor
import EditorTerminal from '../editor/terminal/Terminal.jsx';
import "../../index.css"
import GenerateInput from './Generate';
function CodeEditor({ userData, virtualboxId }) {
  
  const editorRef = useRef(null);
  const monacoRef = useRef(null)
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [files, setFiles] = useState([]);
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [activeFile, setActiveFile] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const [terminals, setTerminals] = useState([]);
  const [cursorLine, setCursorLine] = useState(0);
  const [generate, setGenerate] = useState({ show: false, id: "" ,width:0,widget:undefined| undefined,line:0,pref:[]})
  const [decorations, setDecorations] = useState({ options: [], instance: undefined })
  const editorContainerRef=useRef(null)
  const generateWidgetRef=useRef(null);
  const userId=userData["id"]
  let socket;
  console.log(userData,userId)
  useEffect(() => {
    if (userData && virtualboxId) {
      socketRef.current = io(`http://localhost:4000?userId=${userId}&virtualboxId=${virtualboxId}`);
       socket = socketRef.current;
      const resizeObserver=new ResizeObserver((entries)=>{
        for(const entry of entries)
        {
          const {width}=entry.contentRect
          setGenerate((prev)=>{
            return {...prev,width}
          })
        }
      })
      const onLoadedEvent = (files) => {
        console.log(files);
        setFiles(files);
      };
       if(editorContainerRef.current)
       {
        resizeObserver.observe(editorContainerRef.current)
       }
      const onConnect = () => console.log("Connected");
      const onDisconnect = () => console.log("Disconnected");
      
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

      return () => {
        if (socketRef.current) {
          socket.off("loaded", onLoadedEvent);
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
          socket.off("connect_error");
          socket.off("error");
          resizeObserver.disconnect();
        }
      };
    }
  }, [userId, virtualboxId]);

  const handleDeleteFile = (file) => {
    socketRef.current.emit("deleteFile", file.id, (response) => {
      setFiles(response);
    });
    closeTab(file.id);
  };

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
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tab.id);
      if (exists) {
        setActiveId(exists.id);
        return prev;
      }
      return [...prev, tab];
    });

    socketRef.current.emit("getFile", tab.id, (response) => {
      setActiveFile(response);
      setLoading(false);
    });

    setEditorLanguage(processFiles(tab.name));
    setActiveId(tab.id);
  };

  const closeTab = (tab) => {
    const numTabs = tabs.length;
    const index = tabs.findIndex((t) => t.id === tab.id);
    if (index === -1) return;
    const nextId =
      activeId === tab.id
        ? numTabs === 1
          ? null
          : index < numTabs - 1
            ? tabs[index + 1].id
            : tabs[index - 1].id
        : activeId;

    const nextTab = tabs.find((t) => t.id === nextId);
    if (nextTab) selectFile(nextTab);
    else setActiveId(null);

    setTabs((prev) => prev.filter((t) => t.id !== tab.id));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        setTabs((prev) => prev.map((tab) => (tab.id === activeId ? { ...tab, saved: true } : tab)));

        if (editorRef.current) {
          const fileContent = editorRef.current.getValue();
          socketRef.current.emit("saveFile", activeId, fileContent);
        } else {
          console.error("Editor not initialized");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, editorRef, socketRef]);

  const handleDeleteFolder = (folder) => {

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
    if (generate.show) {
      editorRef.current?.changeViewZones((changeAccessor) => {
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

      editorRef.current?.addContentWidget(contentWidget);

      if (generateRef.current && generateWidgetRef.current) {
        editorRef.current?.applyFontInfo(generateRef.current);
        editorRef.current?.applyFontInfo(generateWidgetRef.current);
      }
    } else {
      editorRef.current?.changeViewZones((changeAccessor) => {
        changeAccessor.removeZone(generate.id);
        setGenerate((prev) => {
          return { ...prev, id: '' };
        });
      });

      if (!generate.widget) return;
      editorRef.current?.removeContentWidget(generate.widget);
      setGenerate((prev) => {
        return {
          ...prev,
          widget: undefined,
        };
      });
    }
  }, [generate.show]);
useEffect(()=>{
     if(decorations.options.length===0) 
     {
      decorations.instance?.clear()
     }

     if(decorations.instance)
     {
      decorations.instance.set(decorations.options)
     }
     else{
      const instance=editorRef.current?.createDecorationsCollection()
      instance?.set(decorations.options);
      setDecorations((prev)=>{
        return{
          ...prev,
          instance,
        }
      })
     }
},[decorations.options])
// console.log(socket)
  return (
    <>
    <div ref={generateRef}/>
      <div className="z-50 p-1" ref={generateWidgetRef}>
        {
          socketRef.current && generate.show ? (
            <GenerateInput
            user={userData}
            data={{
              fileName: tabs.find((t) => t.id === activeId)?.name ?? "",
              code: editorRef.current?.getValue() ?? "",
              line: generate.line,
            }}
            editor={{
              language: !editorLanguage,
            }}
            cancel={() => {}}
            submit={(str) => {}}
            width={generate.width - 90}
            onExpand={() => {
              editorRef.current?.changeViewZones((changeAccessor) => {
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
              const file = editorRef.current?.getValue();
          
              const lines = file.split("\n") || [];
              lines.splice(line - 1, 0, code);
              const updatedFile = lines.join("\n");
              editorRef.current?.setValue(updatedFile);
            }}
            socket={socketRef.current}
          />
          
          ) : null
        }
      </div>
      <Sidebar
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
              { id: `projects/${virtualboxId}/${name}`, name, type: "file" },
            ]);
          } else {
            console.log("adding folder...");
          }
        }}
      />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel maxSize={75} minSize={30} defaultSize={60} className="flex flex-col p-2 border-gradient">
          <div className="h-10 w-full flex gap-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                saved={tab.saved}
                selected={activeId === tab.id}
                onClick={() => selectFile(tab)}
                onClose={() => closeTab(tab)}
              >
                {tab.name}
              </Tab>
            ))}
          </div>
          <div  ref={editorContainerRef}className="grow w-full overflow-hidden rounded-lg">
            {activeId === null ? (
              <div className="flex items-center w-full h-full justify-center text-xl font-medium">
                <FileJson /> No file selected
              </div>
            ) : (
              <Suspense fallback={<div>Loading Editor...</div>}>
              <Editor
                height={"100%"}
                defaultLanguage="javascript"
                theme="vs-dark"
                beforeMount={(monaco) => {
                  monacoRef.current = monaco;
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                  editorRef.current.onDidChangeCursorPosition((e) => {
                    const { column, lineNumber } = e.position;
                    if (lineNumber !== cursorLine) setCursorLine(lineNumber);
        
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
        
                  editorRef.current.onDidBlurEditorText(() => {
                    setDecorations((prev) => ({
                      ...prev,
                      options: [],
                    }));
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
                onChange={() => {
                  setTabs((prev) => prev.map((tab) => (tab.id === activeId ? { ...tab, saved: false } : tab)));
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
            )}
          </div>

        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40} className="border-gradient">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} minSize={20} className="p-2 flex flex-col border-gradient">
              <div className="h-10 w-full flex gap-2">
                <Button variant={"secondary"} size={"sm"} className="min w-auto justify-between px-2">
                  localhost:3000 <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="w-full grow rounded-lg bg-foreground"></div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20} className="p-2 flex flex-col border-gradient">
              <div className="h-10 w-full flex gap-2">
                <Tab selected>
                  <SquareTerminal className='w-4 h-4 mr-2'></SquareTerminal>
                  Shell</Tab>
                <Button size={"sm"}
                  variant={"foreground"}
                  className="font-normal select-none text-muted-foreground"
                >
                  <Plus className="w-4 h-4" />
                </Button>

              </div>
              <div className="w-full grow rounded-lg bg-gray">
                {socketRef.current ? <EditorTerminal socket={socketRef.current} /> : null}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

export default CodeEditor;
