
import { files } from './data/files';
import { themes } from './data/themes';

export const commands: { [key: string]: (args?: string[]) => string | Promise<string> } = {
    help: () => {
        return `<span class='keyword'>about</span>          Who is Pedro?<br/>
<span class='keyword'>whoami</span>         About me<br/>
<span class='keyword'>blog</span>           See all my posts under DevTo<br/>
<span class='keyword'>social</span>         Display social networks<br/>
<span class='keyword'>projects</span>       View coding projects<br/>
<span class='keyword'>stack</span>          View my current stack<br/>
<span class='keyword'>resume</span>         Get my online resume link<br/>
<span class='keyword'>history</span>        View command history<br/>
<span class='keyword'>help</span>           You obviously already know what this does<br/>
<span class='keyword'>email</span>          Do you not prefer use one of my social networks?<br/>
<span class='keyword'>clear</span>          Clear terminal<br/>
<span class='keyword'>banner</span>         Display the header<br/>
<span class='keyword'>reload</span>         Reloads the page cleaning history<br/>
<span class='keyword'>ls</span>             List files in current directory<br/>
<span class='keyword'>cat</span>            Display file content<br/>
<span class='keyword'>theme</span>          Change terminal theme<br/>
<span class='keyword'>sudo</span>           Force administrator mode (it's your responsibility)`;
    },
    about: () => files["about.txt"],
    whoami: () => files["whoami.txt"],
    blog: () => "Visite meu blog em https://paino.dev/blog",
    social: () => `LinkedIn: <a href="https://www.linkedin.com/in/pedro-paino" target="_blank">linkedin.com/in/pedro-paino</a><br/>GitHub: <a href="https://github.com/painodev" target="_blank">github.com/painodev</a><br/>Twitter: <a href="https://twitter.com/painodev" target="_blank">@painodev</a>`,
    projects: (args?: string[]) => {
        const projectList = files["projects.txt"] as unknown as { name: string; description: string; link: string }[];
        if (!args || args.length === 0) {
            let output = "Trabalhei em vários projetos como desenvolvedor freelancer ou como parte de equipes multifuncionais, os mais recentes foram:\n\n";
            projectList.forEach(project => {
                output += `<span class='keyword'>${project.name}</span>\n`;
                output += `${project.description}\n`;
                if (project.link) {
                    output += `Link: <a href="${project.link}" target="_blank">${project.link}</a>\n`;
                }
                output += "\n"; // Add a blank line between projects
            });
            output += "Use <span class='keyword'>stack</span> ou <span class='keyword'>resume</span> para ver minhas experiências de uma perspectiva diferente.";
            return output;
        } else {
            const projectName = args.join(" ").toLowerCase();
            const project = projectList.find(p => p.name.toLowerCase() === projectName);
            if (project) {
                return `Nome: ${project.name}\nDescrição: ${project.description}\nLink: <a href="${project.link}" target="_blank">${project.link}</a>`;
            } else {
                return `Projeto '${projectName}' não encontrado. Use 'projects' para listar todos os projetos.`;
            }
        }
    },
    stack: () => {
        const skills = files["skills.txt"] as unknown as { currently: string; previously: string };
        return `Atualmente sou mais focado em Frontend, e trabalho com ${skills.currently}, mas já trabalhei com ${skills.previously}, e contando...\n\nUse <span class='keyword'>resume</span> ou <span class='keyword'>projects</span> para obter informações detalhadas sobre minha experiência.`;
    },
    resume: () => {
        return `Clique <a href="https://paino.dev/resume" target="_blank">aqui</a> para ver meu currículo no ReadCV ou <a href="/CV_PedroHPaino.pdf" download>aqui</a> para baixar a versão PDF mais recente.\n\nUse <span class='keyword'>stack</span> ou <span class='keyword'>projects</span> para obter informações detalhadas sobre minha experiência.`;
    },
    email: () => files["contact.txt"],
    clear: () => {
        // This command needs to interact with App.tsx state, so it will be handled differently.
        // For now, return an empty string.
        return "";
    },
    history: () => "", // This command needs to interact with App.tsx state.
    banner: () => `
██████╗  █████╗ ██╗███╗   ██╗ ██████╗ 
██╔══██╗██╔══██╗██║████╗  ██║██╔═══██╗
██████╔╝███████║██║██╔██╗ ██║██║   ██║
██╔═══╝ ██╔══██║██║██║╚██╗██║██║   ██║
██║     ██║  ██║██║██║ ╚████║╚██████╔╝
╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
`,
    reload: () => {
        window.location.reload();
        return "";
    },
    sudo: () => {
        window.open('https://www.linkedin.com/in/pedropaino/', '_blank');
        return "Redirecionando para o LinkedIn...";
    },
    ls: () => Object.keys(files).join("&nbsp;&nbsp;&nbsp;&nbsp;"),
    cat: (args?: string[]) => {
        if (!args || args.length === 0) {
            return "Uso: cat <nome_do_arquivo>";
        }
        const filename = args[0];
        // Check if the file exists and is a string (not an array like projects.txt)
        if (filename in files && typeof files[filename as keyof typeof files] === 'string') {
            return files[filename as keyof typeof files] as string;
        } else if (filename in files && typeof files[filename as keyof typeof files] === 'object') {
            return `cat: ${filename}: É um diretório ou um tipo de arquivo não suportado por cat.`;
        } else {
            return `cat: ${filename}: Nenhum arquivo ou diretório encontrado`;
        }
    },
    theme: (args?: string[]) => {
        if (!args || args.length === 0) {
            return `Temas disponíveis: ${Object.keys(themes).join(", ")}\nUso: theme <nome_do_tema>`;
        }
        const themeName = args[0];
        if (themeName in themes) {
            // This will be handled by useTerminal hook
            return `Tema '${themeName}' aplicado.`;
        } else {
            return `Tema '${themeName}' não encontrado. Temas disponíveis: ${Object.keys(themes).join(", ")}`; 
        }
    }
};
