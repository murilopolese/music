import { createRef, useEffect, useMemo, useState } from 'react'
import React from 'react'
import styles from './Player.module.css'
import Search from '../search/Search.tsx'
import Progress from '../progress/Progress.tsx'
import List from '../list/List.tsx'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import AudioContext from '../AudioContext.tsx'

function Player() {
  const [ files, setFiles ] = useState<string[]>([]);
  const [ selectedFile, setSelectedFile ] = useState('');
  const [ audio, setAudio ] = useState<HTMLAudioElement>(new Audio());
  const [ playing, setPlaying ] = useState(false);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ percent, setPercent ] = useState(0);
  const [ loading, setLoading ] = useState(false);
  const [ searchParams, setSearchParams ] = useSearchParams();
  const { title, time } = useParams();
  const scrollToRef = createRef();
  const navigate = useNavigate();

  const filteredFiles = useMemo(() => {
    return files.filter((title: string) => {
      if (searchTerm.trim() == '') return true
      return title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    });
  }, [searchTerm, files])

  // Load initial data
  useEffect(() => {
    fetch(`/music/db.json`)
    .then(r => r.json())
    .then((db) => {
        setFiles(db.files)
      })
  }, [])

  // Update search *term* from search *params*
  useEffect(() => {
    if (searchParams.get('q') != null) {
      setSearchTerm(searchParams.get('q') || '')
    }
  }, []);

  // Update selected file and current time based on url params
  useEffect(() => {
    let newAudio = new Audio();
    if (title) {
      newAudio = loadAudio(title||'');
      if (time) {
        newAudio.currentTime = parseFloat(time);
      }
    }
    audio.pause();
    setPlaying(false);
    setAudio(newAudio);
    setSelectedFile(title||'');
  }, [title, time]);

  // Rebind audio end event
  useEffect(() => {
    // The "ended" event needs to be reassigned every time the audio or filtered files change
    // because the randomize function depends on a piece of state that does not update.
    const onEnd = () => {
      setPlaying(false);
      randomize();
    };
    audio.addEventListener('ended', onEnd);
    return () => audio.removeEventListener('ended', onEnd);
  }, [filteredFiles, audio]);


  function loadAudio(title: string) {
    let newAudio = new Audio();
    newAudio.addEventListener('waiting', () => {
      setLoading(true);
    });
    newAudio.addEventListener('playing', () => {
      setLoading(false);
    });
    newAudio.addEventListener('timeupdate', () => {
      if (newAudio.duration) {
        const percent = (newAudio.currentTime / newAudio.duration) * 100;
        setPercent(percent);
      }
    })
    newAudio.setAttribute('src', `/music/${title}`)
    return newAudio;
  }

  function handleItemSelection(title: string) {
    if (document.body.clientWidth < 700) {
      audio.pause();
      setPlaying(false);
      if (title == selectedFile) {
        window.open(`/music/${title}`, '_blank', 'noopener,noreferrer');
      } else {
        setSelectedFile(title);
      }
      return
    }
    if (!selectedFile) {
      const newAudio = loadAudio(title);
      newAudio.play();
      setAudio(newAudio);
      setSelectedFile(title);
      setPlaying(true);
    } else {
      if (selectedFile == title) {
        if (playing) {
          audio.pause();
          setPlaying(false);
        } else {
          audio.play();
          setPlaying(true);
        }
      } else {
        audio.pause();
        const newAudio = loadAudio(title);
        newAudio.play();
        setAudio(newAudio);
        setSelectedFile(title);
        setPlaying(true);
      }
    }
  }

  function handleSeek(e: React.MouseEvent<Element>) {
    if (!audio.duration) return
    const { target } = e;
    const el = target as HTMLElement;
    const normalizedTime = Math.floor((e.nativeEvent.offsetX/el.clientWidth)*100)/100;
    audio.currentTime = normalizedTime * audio.duration;
  }

  function randomize() {
    const randomIndex = Math.floor(Math.random()*(filteredFiles.length));
    const file = filteredFiles[randomIndex];
    handleItemSelection(file);
  }

  function focusPlaying() {
    if (!selectedFile) return
    const el = scrollToRef.current as HTMLElement;
    if (el) {
      el.scrollIntoView({
        behavior: "smooth"
      });
    }
  }

  function handleSearchTerm(value: string) {
    setSearchTerm(value);
    searchParams.set('q', value);
    setSearchParams(searchParams);
  }

  function handleClear() {
    setPlaying(false);
    setPercent(0);
    setSearchTerm('');
    audio.pause();
    audio.remove();
    window.location.replace('/')
  }

  function handleShare(title: string) {
      const q = searchParams.get('q') || ''
      if (title == selectedFile) {
          navigate(`/file/${title}/${audio.currentTime}?q=${q}`)
      } else {
          navigate(`/file/${title}?q=${q}`)
      }
  }

  return (
    <AudioContext value={audio}>
      <div className={styles.player}>
        <Search 
          searchTerm={searchTerm}
          updateSearchTerm={handleSearchTerm}
          randomize={randomize}
          focusPlaying={focusPlaying}
          clear={handleClear}
          />
        <Progress 
          percent={percent}
          onSeek={handleSeek}
          loading={loading}
          />
        <List 
          items={filteredFiles} 
          selectedItem={selectedFile} 
          playing={playing}
          onItemSelect={handleItemSelection}
          onItemShare={handleShare}
          scrollRef={scrollToRef}
          />
      </div>
    </AudioContext>
  )
}

export default Player;
