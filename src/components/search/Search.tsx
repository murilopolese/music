import type { ChangeEvent } from 'react';
import styles from './Search.module.css'

type SearchProps = {
  searchTerm: string;
  randomize: () => void;
  focusPlaying: () => void;
  clear: () => void;
  updateSearchTerm: (value: string) => void;
}

function Search(props: SearchProps) {
  const { 
    searchTerm, 
    randomize, 
    updateSearchTerm,
    focusPlaying,
    clear
  } = props;
  function onChange(e: ChangeEvent) {
    const { target } = e;
    const el = target as HTMLInputElement;
    updateSearchTerm(el.value)
  }
  return (
    <div className={styles.search}>
      <button onClick={clear}>x</button>
      <input type="text" placeholder="Search" value={searchTerm} onChange={onChange}/>
      <button onClick={randomize}>↯</button>
      <button onClick={focusPlaying}>●</button>
    </div>
  )
}

export default Search;
