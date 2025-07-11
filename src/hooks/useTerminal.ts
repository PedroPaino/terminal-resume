import { useState, useEffect, useRef, useCallback } from 'react';
import { commands } from '../commands';
import { themes } from '../data/themes';

interface UseTerminalProps {
    banner: string;
    welcomeMessages: string[];
}

export const useTerminal = ({ banner, welcomeMessages }: UseTerminalProps) => {
    const [outputLines, setOutputLines] = useState<string[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>('');
    const [currentPrompt] = useState<string>('paino@dev~$');
    const outputRef = useRef<HTMLDivElement>(null);
    const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('dracula');

    useEffect(() => {
        const root = document.documentElement;
        const theme = themes[currentTheme];
        if (theme) {
            for (const [key, value] of Object.entries(theme)) {
                root.style.setProperty(`--${key}`, value);
            }
        }
    }, [currentTheme]);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [outputLines]);

    const typeWriter = useCallback((text: string, callback?: () => void) => {
        let i = 0;
        let currentTypedLine = '';
        const interval = setInterval(() => {
            if (i < text.length) {
                currentTypedLine += text.charAt(i);
                setOutputLines(prev => {
                    const newLines = [...prev];
                    newLines[newLines.length - 1] = currentTypedLine;
                    return newLines;
                });
                i++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 10);
    }, []);

    useEffect(() => {
        setOutputLines([banner]);

        let messageIndex = 0;
        const typeNextWelcomeMessage = () => {
            if (messageIndex < welcomeMessages.length) {
                setOutputLines(prev => [...prev, '']);
                typeWriter(welcomeMessages[messageIndex], () => {
                    messageIndex++;
                    typeNextWelcomeMessage();
                });
            }
        };

        setTimeout(() => {
            typeNextWelcomeMessage();
        }, 100);
    }, [banner, welcomeMessages, typeWriter]);

    const executeCommand = useCallback((command: string) => {
        if (!command.trim()) return;

        const [cmd, ...args] = command.split(" ");
        const commandOutputLine = `<div><span style="color: var(--prompt);">${currentPrompt}</span> <span style="color: var(--green);">${command}</span></div>`;
        setOutputLines(prev => [...prev, commandOutputLine]);
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(commandHistory.length + 1);

        const commandFn = commands[cmd];
        if (commandFn) {
            let result = commandFn(args);
            if (cmd === 'clear') {
                setOutputLines([]);
                result = "";
            } else if (cmd === 'history') {
                result = commandHistory.join("<br/>");
            } else if (cmd === 'theme') {
                const themeName = args[0];
                if (themeName && themeName in themes) {
                    setCurrentTheme(themeName as keyof typeof themes);
                }
            }

            setOutputLines(prev => [...prev, '']);
            if (typeof result === 'string') {
                typeWriter(result);
            } else {
                result.then(res => {
                    typeWriter(res);
                });
            }
        } else {
            setOutputLines(prev => [...prev, '']);
            typeWriter(`Comando não encontrado: ${command}`);
        }
        setInputValue('');
    }, [currentPrompt, commandHistory, typeWriter, setCurrentTheme]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            executeCommand(inputValue);
        } else if (event.key === "ArrowUp") {
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[newIndex] || '');
            }
        } else if (event.key === "ArrowDown") {
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[newIndex]);
            } else {
                setHistoryIndex(commandHistory.length);
                setInputValue('');
            }
        }
    }, [executeCommand, inputValue, historyIndex, commandHistory]);

    return {
        outputLines,
        inputValue,
        currentPrompt,
        outputRef,
        setInputValue,
        handleKeyDown,
        executeCommand,
        currentTheme, // Expose currentTheme
        setCurrentTheme, // Expose setCurrentTheme
    };
};