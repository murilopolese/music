import type { MouseEvent } from 'react';
import styles from './Progress.module.css';

type ProgressProps = {
  percent: number;
  loading: boolean;
  onSeek: (e: MouseEvent) => void;
};

function Progress(props: ProgressProps) {
  const { percent, loading, onSeek } = props;
  const style = {
    width: `${percent}%`
  }
  return (
    <div className={[styles.progress, loading?styles.loading:''].join(' ')} onClick={onSeek}>
      <div className={styles.bar} style={style}></div>
    </div>
  )
}

export default Progress;
