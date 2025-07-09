import { createContext } from "react";
const AudioContext = createContext<HTMLAudioElement>(new Audio());
export default AudioContext