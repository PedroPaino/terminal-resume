import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTerminal } from './hooks/useTerminal';

const banner = `
██████╗  █████╗ ██╗███╗   ██╗ ██████╗ 
██╔══██╗██╔══██╗██║████╗  ██║██╔═══██╗
██████╔╝███████║██║██╔██╗ ██║██║   ██║
██╔═══╝ ██╔══██║██║██║╚██╗██║██║   ██║
██║     ██║  ██║██║██║ ╚████║╚██████╔╝
╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
`;

const welcomeMessages = [
    "Bem-vindo ao meu terminal!",
    "Digite 'help' para ver os comandos disponíveis."
];

function getCaretCoordinates(input: HTMLInputElement) {
    const span = document.createElement("span");
    const computed = window.getComputedStyle(input);

    for (const prop of [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "letterSpacing",
        "whiteSpace",
        "lineHeight",
        "textTransform",
        "paddingLeft",
        "paddingRight",
        "borderLeftWidth",
        "borderRightWidth",
        "boxSizing",
        "fontFeatureSettings",
        "fontVariantLigatures"
    ]) {
        (span.style as unknown as Record<string, string>)[prop] = computed.getPropertyValue(prop);
    }

    span.textContent = input.value.substring(0, input.selectionStart || 0);
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";
    span.style.overflow = "hidden"; // Adicionado para corresponder ao input

    document.body.appendChild(span);
    const width = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    return width;
}

function App({ onClose }: { onClose: () => void }) {
    console.log("App component rendered");
    console.log("App component rendered");
    const inputRef = useRef<HTMLInputElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null);

    const { outputLines, inputValue, currentPrompt, outputRef, setInputValue, handleKeyDown } = useTerminal({
        banner,
        welcomeMessages,
    });

    // Drag functionality
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        if (dragHandleRef.current) {
            setOffset({
                x: e.clientX - dragHandleRef.current.offsetLeft,
                y: e.clientY - dragHandleRef.current.offsetTop,
            });
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && dragHandleRef.current) {
            dragHandleRef.current.style.left = `${e.clientX - offset.x}px`;
            dragHandleRef.current.style.top = `${e.clientY - offset.y}px`;
        }
    }, [isDragging, offset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Resize functionality
    const [isResizing, setIsResizing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(800);
    const [windowHeight, setWindowHeight] = useState(600);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault(); // Prevent text selection during resize
    };

    const handleResizeMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing) {
            setWindowWidth(e.clientX - (dragHandleRef.current?.offsetLeft || 0));
            setWindowHeight(e.clientY - (dragHandleRef.current?.offsetTop || 0));
        }
    }, [isResizing]);

    const handleResizeMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleResizeMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleResizeMouseMove);
            document.removeEventListener('mouseup', handleResizeMouseUp);
        };
    }, [isDragging, isResizing, offset, handleMouseMove, handleMouseUp, handleResizeMouseMove, handleResizeMouseUp]);

    // Window control buttons
    const [isMaximized, setIsMaximized] = useState(false);

    const handleMaximize = () => {
        setIsMaximized(prev => !prev);
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();

            const cursor = document.querySelector('.custom-cursor') as HTMLElement;
            const inputElement = inputRef.current;
            const promptSpan = document.getElementById('prompt');

            if (cursor && promptSpan && inputElement) {
                const caretX = getCaretCoordinates(inputElement);
                const promptWidth = promptSpan.offsetWidth;
                const inputStyle = window.getComputedStyle(inputElement);
                const inputPaddingLeft = parseFloat(inputStyle.paddingLeft);
                
                cursor.style.left = `${promptWidth + inputPaddingLeft + caretX}px`;
            }
        }
    }, [inputValue]);

    return (
        <div
            id="drag-handle"
            ref={dragHandleRef}
            onMouseDown={handleMouseDown}
            style={{
                width: isMaximized ? '100vw' : `${windowWidth}px`,
                height: isMaximized ? '100vh' : `${windowHeight}px`,
                top: isMaximized ? '0' : dragHandleRef.current?.style.top,
                left: isMaximized ? '0' : dragHandleRef.current?.style.left,
                margin: isMaximized ? '0' : 'auto',
                position: isMaximized ? 'fixed' : 'absolute',
                zIndex: isMaximized ? 9999 : 'auto',
            }}
        >
            <div id="terminal-window" onClick={() => inputRef.current?.focus()}>
                <div id="terminal-header">
                    <div className="buttons">
                        <div className="btn red" onClick={onClose}></div>
                        <div className="btn yellow" onClick={handleMaximize}></div>
                        <div className="btn green" onClick={handleMaximize}></div>
                    </div>
                    <div className="title">paino@dev: ~</div>
                </div>
                <div id="terminal" style={{ display: 'flex' }}>
                    <div id="output" ref={outputRef}>
                        {outputLines.map((line, index) => (
                            <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
                        ))}
                    </div>
                    <div id="input-line">
                        <span id="prompt">{currentPrompt} </span>
                        <input
                            type="text"
                            id="input"
                            autoFocus
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="custom-cursor"></span>
                    </div>
                </div>
            </div>
            <div id="resize-handle" onMouseDown={handleResizeMouseDown}></div>
        </div>
    );
}

export default App;