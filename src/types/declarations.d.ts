// declaracoes globais de tipos para arquivos css e assets
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css';
