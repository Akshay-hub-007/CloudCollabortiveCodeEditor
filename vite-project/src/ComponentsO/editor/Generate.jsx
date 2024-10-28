import { Editor } from '@monaco-editor/react';
import { Button } from '../../components/ui/button';
import { Check, Loader2, RotateCw, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GenerateInput({ cancel, submit, width, onExpand, onAccept, data, editor, socket, userId }) {
    const [code, setCode] = useState(`function add(a, b) {
        return a + b;
    }
    const result = add(2, 3);
    console.log(result);
    `);
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState({ generate: false, regenerate: false });
    const [input, setInput] = useState("");
    const [prompt, setPrompt] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

    const handleGenerateCode = (regenerate, input) => {
        console.log(input)
        setLoading({ generate: !regenerate, regenerate });
        setPrompt(input);

        socket.emit('generateCode', data.fileName, data.code, data.line, regenerate ? prompt : input, (res) => {
            console.log(res)
            
            if (!res.success) {
                console.error("Code generation failed:", res.error || "Unknown error");
                return;
            }
            console.log(res)
            setCode(res.response);
        });
    };

    useEffect(() => {
        if (code) {
            setExpanded(true);
            onExpand();
            setLoading({ generate: false, regenerate: false });
        }
    }, [code]);

    return (
        <div className='w-auto pr-4 space-y-2'>
            <div className='w-auto flex items-center font-sans space-x-2'>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    ref={inputRef}
                    style={{ width: `${width}px` }}
                    placeholder='Generate code with a prompt'
                    className="h-8 w-auto rounded-md border border-white bg-transparent px-3 py-1 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button size={"sm"} disabled={loading.generate || input === ""} onClick={() => handleGenerateCode(false, input)}>
                    {loading.generate ? (
                        <>
                            <Loader2 className='animate-spin h-3 w-3 mr-2' /> Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className='h-3 w-3 mr-2' /> Generate Code
                        </>
                    )}
                </Button>
            </div>
            {expanded && (
                <>
                    <div className='rounded-md border border-muted-foreground w-full h-28 overflow-y-scroll p-2'>
                        <Editor
                            height={"100%"}
                            defaultLanguage={editor.language}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                padding: { bottom: 4, top: 4 },
                                scrollBeyondLastColumn: false,
                                readOnly: true,
                                lineNumbers: "off",
                                folding: false,
                                fontFamily: "var(--font-geist-mono)",
                            }}
                            value={code} 
                        />
                    </div>
                    <div className='flex space-x-2'>
                        <Button disabled={loading.generate || loading.regenerate} size={"sm"} onClick={() => onAccept(code)}>
                            <Check className="w-3 h-3 mr-2" /> Accept
                        </Button>
                        <Button onClick={() => handleGenerateCode(true, input)} disabled={loading.generate || loading.regenerate} variant={"outline"} size={"sm"} className="bg-transparent border-muted-foreground">
                            {loading.regenerate ? (
                                <>
                                    <Loader2 className='animate-spin h-3 w-3 mr-2' /> Regenerating...
                                </>
                            ) : (
                                <>
                                    <RotateCw className='w-3 h-3 mr-2' /> Re-Generate
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default GenerateInput;