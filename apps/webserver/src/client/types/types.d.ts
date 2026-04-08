declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare function gtag(command: string, action: string, params?: Record<string, string>): void;
